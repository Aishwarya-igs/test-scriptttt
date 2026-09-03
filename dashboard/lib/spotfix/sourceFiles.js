/**
 * The write boundary for spot fixes.
 *
 * A spot fix is the only feature in this dashboard that modifies files on
 * disk, so which files it may touch is deliberately narrow and enforced
 * here rather than trusted from the model's output. Everything a Playwright
 * failure could legitimately need to change lives in the project's spec and
 * source roots (specs, page objects, business functions, utils, test data) —
 * discovered per project rather than hardcoded, see ../projectConventions.js.
 *
 * Explicitly NOT editable: playwright.config.ts (run/environment config, not
 * a test-logic bug), .env and anything at the repo root, dashboard/ itself,
 * and node_modules.
 */
const fs = require('fs');
const path = require('path');
const { REPO_ROOT } = require('../paths');
const { getConventions } = require('../projectConventions');
const { enclosingTestBlock } = require('./testBlocks');

const EDITABLE_ROOTS = getConventions().editableRoots;

const EDITABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Guards against sending an enormous generated/bundled file to the model and
// against a proposal rewriting something unreviewable.
const MAX_FILE_BYTES = 256 * 1024;

// Windows/macOS paths are case-insensitive, so compare folded — but always
// read and write the path as resolved, never the folded copy.
const CASE_INSENSITIVE_FS = process.platform === 'win32' || process.platform === 'darwin';
const forCompare = (p) => (CASE_INSENSITIVE_FS ? p.toLowerCase() : p);

function isUnderEditableRoot(resolved) {
  const candidate = forCompare(resolved);
  return EDITABLE_ROOTS.some((rawRoot) => {
    const root = forCompare(rawRoot);
    return candidate === root || candidate.startsWith(root + path.sep);
  });
}

/**
 * Line endings are normalised to \n everywhere inside the spot-fix pipeline.
 *
 * This repo's sources are CRLF (checked out on Windows), but a model emits
 * plain \n. Without normalising, any multi-line `oldCode` fails the
 * exact-match check no matter how faithfully the model copied it — the
 * proposal looks like a paraphrase when it is really just a \r mismatch.
 * The file's original ending is preserved and restored on write so applying
 * a fix never rewrites every line of the file.
 */
const normalizeEol = (text) => text.replace(/\r\n/g, '\n');
const applyEol = (text, eol) => (eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text);
const detectEol = (raw) => (raw.includes('\r\n') ? '\r\n' : '\n');

/**
 * Resolves a path (absolute, or repo-relative as a model is likely to emit)
 * to an editable source file. Returns { path, relative, content, eol } where
 * `content` is \n-normalised, or throws with a reason suitable for showing
 * the user.
 */
function resolveEditableFile(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') {
    throw new Error('Edit is missing a file path');
  }
  // path.resolve on an already-absolute path is a no-op, so this handles both
  // absolute paths (from stack traces) and repo-relative ones (from the model).
  const resolved = path.resolve(REPO_ROOT, rawPath.trim());

  if (!isUnderEditableRoot(resolved)) {
    const allowed = EDITABLE_ROOTS.map((r) => `${path.relative(REPO_ROOT, r).split(path.sep).join('/')}/`).join(', ');
    throw new Error(`Refusing to edit "${rawPath}": only files under ${allowed} may be changed`);
  }
  if (!EDITABLE_EXTENSIONS.has(path.extname(resolved).toLowerCase())) {
    throw new Error(`Refusing to edit "${rawPath}": not a source file`);
  }

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch {
    throw new Error(`File does not exist: ${rawPath}`);
  }
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${rawPath}`);
  }
  if (stat.size > MAX_FILE_BYTES) {
    throw new Error(`File is too large to spot-fix safely: ${rawPath}`);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  return {
    path: resolved,
    relative: path.relative(REPO_ROOT, resolved).split(path.sep).join('/'),
    content: normalizeEol(raw),
    eol: detectEol(raw),
  };
}

/**
 * The files worth showing the model, most-relevant first.
 *
 * The spec file alone is usually not enough: in this repo a failing wait
 * typically originates in a page object (src/pom/*) or business function
 * (src/businessFunction/*) several frames up, so the stack trace is mined for
 * additional in-repo frames. Playwright stack frames look like
 * "    at Foo.bar (C:\...\src\pom\X.ts:312:37)" as well as bare
 * "    at C:\...\tests\y.spec.ts:60:24".
 */
function collectCandidateFiles(test, { limit = 3 } = {}) {
  const ordered = [];
  const byPath = new Map();

  const add = (candidatePath, line) => {
    if (!candidatePath) return;
    let file;
    try {
      file = resolveEditableFile(candidatePath);
    } catch {
      return; // Not editable (node_modules frame, config, missing) — just skip.
    }
    const existing = byPath.get(file.path);
    if (existing) {
      // Same file appearing in several frames: keep every line of interest.
      if (line) existing.lines.add(line);
      return;
    }
    const entry = { ...file, lines: new Set(line ? [line] : []) };
    byPath.set(file.path, entry);
    ordered.push(entry);
  };

  add(test.file, test.line);

  const stack = test.error?.stack || '';
  // Capture the path and line of each frame. Handles both drive-letter
  // absolute paths and POSIX ones, and both "at Foo.bar (path:l:c)" and
  // bare "at path:l:c" frame shapes.
  for (const match of stack.matchAll(
    /(?:at\s+(?:.*?\s+)?\(?)([A-Za-z]:[\\/][^\n():]*?|\/[^\n():]*?):(\d+):\d+/g
  )) {
    add(match[1], Number(match[2]));
  }

  return ordered.slice(0, limit);
}

/**
 * The exact source lines the failure came from, deepest frame first.
 *
 * Without this the model infers what broke from the test's *title*, which is
 * actively misleading: a test named "…Add to Watchlist option is not
 * displayed…" failed on a preceding precondition assertion, and the model
 * duly proposed inverting the watchlist assertion on the next line — one that
 * never executed. Quoting the failing line removes the guesswork.
 */
function describeFailingLines(test, { limit = 3 } = {}) {
  const stack = test.error?.stack || '';
  const out = [];
  const seen = new Set();

  for (const match of stack.matchAll(
    /(?:at\s+(?:.*?\s+)?\(?)([A-Za-z]:[\\/][^\n():]*?|\/[^\n():]*?):(\d+):\d+/g
  )) {
    let file;
    try {
      file = resolveEditableFile(match[1]);
    } catch {
      continue; // node_modules or otherwise not ours.
    }
    const line = Number(match[2]);
    const key = `${file.relative}:${line}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const text = file.content.split('\n')[line - 1];
    if (text !== undefined) out.push({ file: file.relative, line, text: text.trim() });
    if (out.length >= limit) break;
  }
  return out;
}

const ASSERTION_LINE = /\bexpect\s*\(/;

/**
 * The full sequence of expect() calls in the test that failed, split into
 * what ran before the failure, the failing assertion itself, and — the part
 * that matters most — what never ran because the test died before reaching it.
 *
 * Quoting only the failing line (describeFailingLines) turned out not to be
 * enough: a model shown just "expect(result.isLiveContentVisible).toBe(true)
 * failed" still could not tell that was a SETUP check for a test whose real
 * subject, per its own title, was a different assertion three lines later
 * that never ran — and "fixed" the setup check instead of recognising there
 * was nothing here for it to legitimately fix. Showing the whole sequence
 * makes that structure explicit instead of asking the model to infer it.
 */
function describeAssertionContext(test) {
  const [frame] = describeFailingLines(test, { limit: 1 });
  if (!frame) return null;

  let file;
  try {
    file = resolveEditableFile(path.join(REPO_ROOT, frame.file));
  } catch {
    return null;
  }
  const lines = file.content.split('\n');
  const block = enclosingTestBlock(lines, frame.line);
  if (!block) return null;

  const assertions = [];
  for (let i = block.start - 1; i < block.end - 1 && i < lines.length; i += 1) {
    if (ASSERTION_LINE.test(lines[i])) assertions.push({ line: i + 1, text: lines[i].trim() });
  }
  const failingIndex = assertions.findIndex((a) => a.line === frame.line);
  if (failingIndex === -1) return null;

  return {
    file: file.relative,
    before: assertions.slice(0, failingIndex),
    failing: assertions[failingIndex],
    after: assertions.slice(failingIndex + 1),
  };
}

/**
 * Widens each candidate file's excerpt to also cover wherever the strings in
 * the error message are defined.
 *
 * Stack frames alone are not enough under the Page Object pattern used here.
 * A failing wait reports the frame that *used* a locator — OTTAuthPage.ts:312
 * — while the locator's text is declared in the constructor hundreds of lines
 * away (OTTAuthPage.ts:123). Excerpting only around the stack frame hides the
 * one line that needs changing, and the model then "fixes" whatever it can
 * see instead: in the observed case it edited an expectedErrorMessage
 * argument that is only ever used for an assertion, so the rerun waited for
 * the same text and failed identically.
 *
 * Kept separate from `lines` (the failure anchors) because those also drive
 * which occurrence of a repeated snippet an edit refers to; a match somewhere
 * else in the file must widen the context without moving that anchor.
 */
function addErrorLiteralMatches(files, errorText) {
  // Quoted literals from the error, e.g. getByText('Please enter a valid…').
  const literals = [...String(errorText || '').matchAll(/['"`]([^'"`\n]{6,120})['"`]/g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (!literals.length) return files;

  for (const file of files) {
    const extra = new Set();
    const lines = file.content.split('\n');
    for (const [i, line] of lines.entries()) {
      if (literals.some((lit) => line.includes(lit))) extra.add(i + 1);
    }
    file.extraLines = extra;
  }
  return files;
}

// Where a failing test's page-object/business-function calls actually live,
// searched when neither the stack trace nor an error-message literal points
// at the right file (see addCalledMethodSources below). Discovered per
// project — see ../projectConventions.js.
function listHelperFiles() {
  return getConventions().helperDirs.flatMap((dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return [];
    }
    return entries
      .filter((name) => EDITABLE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .map((name) => path.join(dir, name));
  });
}

/**
 * Line number (1-based) of `name`'s declaration in `content`, as either a
 * class method (src/pom/*) or an exported helper function
 * (src/businessFunction/*, always `export async function name(...)` in this
 * repo, checked defensively for the plain/arrow-const forms too), or null.
 */
function findDeclarationLine(content, name) {
  const patterns = [
    new RegExp(`^\\s*(?:private |public |protected )?(?:async )?${name}\\s*\\(`), // class method
    new RegExp(`^\\s*export\\s+(?:async\\s+)?function\\s+${name}\\s*\\(`), // exported function
    new RegExp(`^\\s*(?:export\\s+)?const\\s+${name}\\s*=\\s*(?:async\\s*)?\\(`), // arrow-const
  ];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (patterns.some((p) => p.test(lines[i]))) return i + 1;
  }
  return null;
}

/** Every line in `content` (1-based) referencing the bare identifier `name`. */
function findIdentifierLines(content, name) {
  const ref = new RegExp(`\\b${name}\\b`);
  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (ref.test(lines[i])) out.push(i + 1);
  }
  return out;
}

/** Adds `candidatePath` to `files` (deduped) anchored at `anchorLines`, if it resolves. Returns the entry, or null. */
function addCandidateFile(files, known, candidatePath, anchorLines) {
  if (known.has(candidatePath)) return null;
  let file;
  try {
    file = resolveEditableFile(candidatePath);
  } catch {
    return null;
  }
  const entry = { ...file, lines: new Set(anchorLines) };
  files.push(entry);
  known.add(candidatePath);
  return entry;
}

/**
 * Splits a call expression like `detailsPage.isAddToWatchlistButtonVisible`
 * or a bare `verifyLiveContentWatchlistAbsence` into { receiver, name }.
 * `receiver` is null for a bare business-function call.
 */
function splitCallee(expr) {
  const dotted = expr.match(/^(\w+)\.(\w+)$/);
  if (dotted) return { receiver: dotted[1], name: dotted[2] };
  const bare = expr.match(/^\w+$/);
  return bare ? { receiver: null, name: expr } : { receiver: null, name: null };
}

/**
 * Traces a failing assertion's value back to the helper code that produced
 * it, when that code returned normally rather than throwing.
 *
 * The stack trace only ever shows frames that were still on the call stack
 * when something threw — a page-object method or business function that
 * completes and simply returns the wrong value (e.g. `''` because it timed
 * out waiting for a toast and swallowed that in a catch) leaves no frame
 * there at all. And addErrorLiteralMatches can't find it either: matching on
 * the error message's literals only works when the source declares the same
 * string the error reports, which isn't true for a value assertion like
 * `expect(x).toContain('removed')` failing with `Received: ""` — there is no
 * shared literal, "" appears nowhere in the source. Without this, the model
 * only ever sees the spec file and proposes rewriting the assertion itself.
 *
 * Two hops, both driven purely by whatever identifiers/names appear in the
 * failing statement — nothing here is specific to any test, module, or
 * naming scheme beyond this repo's two calling conventions:
 *   1. `const x = await recv.method(...)` — traces to a src/pom class method.
 *   2. `const x = await helperFn(...)` — traces to an exported
 *      src/businessFunction function (this repo's tests read a result
 *      object's named property, e.g. `expect(x.someFlag)`, far more often
 *      than the whole call result, so when that shape is seen, hop 2 also
 *      searches the found function's body for wherever `someFlag` is set —
 *      often itself `const someFlag = await recv.method(...)`, which is
 *      resolved the same way as hop 1, one level in).
 * `expect(await recv.method(...))` (no intermediate variable) is handled too.
 */
/**
 * What the failing assertion is actually reading, traced back to the call
 * that produced it: `{ callee: { receiver, name }, propertyName, frame }`,
 * or null when the failing statement isn't an expect() over a traceable
 * call.
 *
 * Split out of addCalledMethodSources (its original and still its main
 * caller) so a second analysis can ask the same question without
 * re-deriving it — see ./swallowedFailures.js, which needs to know exactly
 * which method produced an empty value in order to check whether that
 * method could have discarded a failure on the way.
 */
function resolveAssertedCallee(files, test) {
  const [frame] = describeFailingLines(test, { limit: 1 });
  if (!frame) return null;

  // What expect() is actually reading: `await recv.method(...)`,
  // `recv.property`, or a bare `recv` (possibly with a trailing builtin
  // chain like `.toLowerCase()`, which must NOT be mistaken for a traced
  // call — hence `await` being required for the inline-call shape).
  const exprMatch = frame.text.match(/expect\(\s*(await\s+)?(\w+)(\.\w+)?/);
  if (!exprMatch) return null;
  const isInlineAwait = Boolean(exprMatch[1]);
  const receiver = exprMatch[2];
  const trailing = exprMatch[3] ? exprMatch[3].slice(1) : null;

  let callee = null; // { receiver, name } of the call to trace
  let propertyName = null; // a named property expect() reads off the result, if any

  if (isInlineAwait && trailing) {
    callee = splitCallee(`${receiver}.${trailing}`);
  } else {
    const specFile = files.find((f) => f.relative === frame.file);
    if (specFile) {
      const lines = specFile.content.split('\n');
      // `recv = await X(...)` or `recv = await X.Y(...)` — search backward
      // from the failing line, since the assignment always precedes it.
      const assign = new RegExp(`\\b${receiver}\\s*=\\s*await\\s+([\\w.]+)\\s*\\(`);
      for (let i = Math.min(frame.line, lines.length) - 1; i >= 0 && i > frame.line - 20; i -= 1) {
        const m = lines[i].match(assign);
        if (m) {
          callee = splitCallee(m[1]);
          break;
        }
      }
    }
    if (!isInlineAwait && trailing) propertyName = trailing;
  }
  if (!callee?.name) return null;
  return { callee, propertyName, frame };
}

function addCalledMethodSources(files, test, { maxNewFiles = 3 } = {}) {
  const traced = resolveAssertedCallee(files, test);
  if (!traced) return files;
  const { callee, propertyName } = traced;

  const known = new Set(files.map((f) => f.path));
  let budget = maxNewFiles;

  // Hop 1: find where `callee.name` is declared.
  let hop1;
  for (const candidatePath of listHelperFiles()) {
    if (budget <= 0) break;
    const declLine = (() => {
      try {
        return findDeclarationLine(fs.readFileSync(candidatePath, 'utf-8'), callee.name);
      } catch {
        return null;
      }
    })();
    if (declLine == null) continue;
    const entry = addCandidateFile(files, known, candidatePath, [declLine]);
    if (entry) {
      budget -= 1;
      hop1 = { entry, declLine };
      break; // a name should only be declared once; stop at the first match
    }
  }
  if (!hop1 || !propertyName) return files;

  // Hop 2: `propertyName` is a field the hop-1 function returns, e.g.
  // `expect(result.someFlag)` after `const result = await helperFn(...)`.
  // Anchor on every line in that function referencing it (it is typically
  // both computed and returned on separate lines), and if the computing
  // line is itself another await call, resolve that one level further too.
  const propLines = findIdentifierLines(hop1.entry.content, propertyName);
  for (const line of propLines) hop1.entry.lines.add(line);

  // Must find the line that actually COMPUTES the value, not just any line
  // mentioning the name in file order. This repo's businessFunction modules
  // declare a TS return-type interface (e.g. `isLiveContentVisible: boolean;`)
  // above the function body, and that field appears — and, in source order,
  // is found first — before the real assignment inside the return statement.
  // Blindly using propLines[0] silently picked the type declaration, which
  // never matches either pattern below, so the trace gave up one hop short
  // of the method actually responsible — the model then correctly declined
  // to guess without ever having been shown that method's source at all.
  const hop1Lines = hop1.entry.content.split('\n');
  // Two real shapes seen in this repo's return objects:
  //   1. `propertyName: await x(...)` or `propertyName = await x(...)` —
  //      computed inline, right where it's returned.
  //   2. `propertyName: someOtherName,` — an object-literal field returning
  //      a DIFFERENTLY-named local variable that was computed earlier in the
  //      same function (e.g. `isLiveContentVisible: isLiveIconVisible,` after
  //      `const isLiveIconVisible = await detailsPage.isLiveIconVisible();`
  //      several lines above) — a renaming for the public return shape.
  //      Shape 1's pattern alone can never match this; it has to chase the
  //      aliased name's own assignment as a second, separate lookup.
  const inlinePattern = new RegExp(`${propertyName}\\s*[:=]\\s*await\\s+([\\w.]+)\\s*\\(`);
  const aliasPattern = new RegExp(`${propertyName}\\s*:\\s*(\\w+)\\s*[,}]`);
  let nested = null;
  for (const line of propLines) {
    const text = hop1Lines[line - 1] || '';
    const inline = text.match(inlinePattern);
    if (inline) {
      nested = inline;
      break;
    }
    const alias = text.match(aliasPattern);
    if (alias && alias[1] !== propertyName) {
      const assignPattern = new RegExp(`\\b${alias[1]}\\s*=\\s*await\\s+([\\w.]+)\\s*\\(`);
      const assignLine = hop1Lines.find((l) => assignPattern.test(l));
      const assignMatch = assignLine ? assignLine.match(assignPattern) : null;
      if (assignMatch) {
        nested = assignMatch;
        break;
      }
    }
  }
  const nestedCallee = nested ? splitCallee(nested[1]) : null;
  if (nestedCallee?.name) {
    for (const candidatePath of listHelperFiles()) {
      if (budget <= 0) break;
      const declLine = (() => {
        try {
          return findDeclarationLine(fs.readFileSync(candidatePath, 'utf-8'), nestedCallee.name);
        } catch {
          return null;
        }
      })();
      if (declLine == null) continue;
      if (addCandidateFile(files, known, candidatePath, [declLine])) {
        budget -= 1;
        break;
      }
    }
  }

  return files;
}

/**
 * Builds the slice of a file worth sending to the model: windows of
 * CONTEXT_LINES around each line implicated by the stack trace, merged where
 * they overlap.
 *
 * Whole files are not an option — a business-function module here runs past
 * 1600 lines, and sending several of those at once exceeded the token-per-
 * minute budget of a typical hosted model outright. Excerpting also sharpens
 * the result, since the model is not hunting for the relevant code.
 *
 * Deliberately emits no line-number gutter: the model must copy `oldCode`
 * byte-for-byte for the exact-match apply to work, and a gutter would end up
 * inside the copied snippet. Ranges are stated in the header instead.
 */
function buildExcerpt(file, { contextLines = 25, maxLines = 120 } = {}) {
  const allLines = file.content.split('\n');
  if (allLines.length <= maxLines) {
    return { text: file.content, truncated: false };
  }

  // Stack-frame anchors plus wherever the error's strings are declared.
  const interesting = [...file.lines, ...(file.extraLines || [])].filter((n) => Number.isFinite(n) && n > 0);
  if (!interesting.length) {
    return { text: allLines.slice(0, maxLines).join('\n'), truncated: true };
  }

  const windows = interesting
    .map((line) => ({
      start: Math.max(1, line - contextLines),
      end: Math.min(allLines.length, line + contextLines),
    }))
    .sort((a, b) => a.start - b.start);

  const merged = [windows[0]];
  for (const w of windows.slice(1)) {
    const last = merged[merged.length - 1];
    if (w.start <= last.end + 1) last.end = Math.max(last.end, w.end);
    else merged.push(w);
  }

  const chunks = merged.map((w) => {
    const body = allLines.slice(w.start - 1, w.end).join('\n');
    return `// ---- ${file.relative} lines ${w.start}-${w.end} ----\n${body}`;
  });

  return { text: chunks.join('\n\n// ---- (lines omitted) ----\n\n'), truncated: true };
}

/**
 * Locates the `{ ... }` span of the function/method whose declaration line
 * is `startLine` (1-based), via brace counting from the first `{` at or
 * after it.
 *
 * Deliberately naive — a `{`/`}` sitting inside a string or comment can throw
 * this off by a line or two. That is an acceptable cost here: this only
 * decides how much of a file to show the model as context. The find/replace
 * that actually writes a fix (validateEdit in ./index.js) always re-searches
 * the full file content on disk for an exact `oldCode` match, completely
 * independent of this span — so nothing this function gets wrong can ever
 * cause a wrong edit to be written, only a slightly over/under-inclusive
 * excerpt to be shown.
 */
function functionSpan(content, startLine) {
  const lines = content.split('\n');
  let depth = 0;
  let started = false;
  for (let i = startLine - 1; i < lines.length; i += 1) {
    for (const ch of lines[i]) {
      if (ch === '{') {
        depth += 1;
        started = true;
      } else if (ch === '}') {
        depth -= 1;
      }
    }
    if (started && depth <= 0) return { start: startLine, end: i + 1 };
  }
  // Never found a close (unusual formatting) — fall back to a fixed window
  // rather than running to the end of the file.
  return { start: startLine, end: Math.min(lines.length, startLine + 40) };
}

// `recv.method(`, e.g. `detailsPage.hoverContentThumbnailAndClickWatchlistIcon(`.
const DOTTED_CALL = /\b(\w+)\.(\w+)\s*\(/g;
// A bare business-function call, e.g. `await playContentFromWatchlist(page, {`.
// Requires `await` so this doesn't also match `if (`, `function (`, etc.
const BARE_CALL = /\bawait\s+(\w+)\s*\(/g;

/**
 * Every helper call the failing test makes, in source order, from its
 * `test(...)` declaration down to (and including) the line that actually
 * failed. Calls after that point never ran, so — per the same reasoning as
 * describeAssertionContext — they cannot be evidence for what caused this
 * failure and are deliberately excluded.
 */
function listTestBodyCalls(test) {
  const [frame] = describeFailingLines(test, { limit: 1 });
  if (!frame) return [];

  let file;
  try {
    file = resolveEditableFile(path.join(REPO_ROOT, frame.file));
  } catch {
    return [];
  }
  const lines = file.content.split('\n');
  const block = enclosingTestBlock(lines, frame.line);
  if (!block) return [];

  const calls = [];
  for (let i = block.start - 1; i < frame.line && i < lines.length; i += 1) {
    for (const m of lines[i].matchAll(DOTTED_CALL)) {
      calls.push({ receiver: m[1], method: m[2], line: i + 1 });
    }
    for (const m of lines[i].matchAll(BARE_CALL)) {
      calls.push({ receiver: null, method: m[1], line: i + 1 });
    }
  }
  return calls;
}

/** Adds `candidatePath` to `files` if new, or widens its anchor lines if already present. */
function addOrWidenFile(files, candidatePath, anchorLines) {
  let file;
  try {
    file = resolveEditableFile(candidatePath);
  } catch {
    return null;
  }
  const existing = files.find((f) => f.path === file.path);
  if (existing) {
    for (const ln of anchorLines) existing.lines.add(ln);
    return existing;
  }
  const entry = { ...file, lines: new Set(anchorLines) };
  files.push(entry);
  return entry;
}

/**
 * Shows the model the full implementation of every helper the failing test
 * calls on its way to the failing line — not just the one whose return value
 * directly feeds the failing assertion (addCalledMethodSources handles that
 * narrower case).
 *
 * This closes a real blind spot: a bug can live in a step called BEFORE the
 * one that failed. Observed case — a test called
 * hoverContentThumbnailAndClickWatchlistIcon() twice to simulate "add, then
 * remove", but that method's actual body unconditionally ends by clicking
 * "Add" (it exists to guarantee an item ends up in the watchlist, clicking
 * "Remove" first only when needed to get there) — so the second call
 * silently re-added the item instead of leaving it removed, and no amount of
 * smarter toast-text matching in the method read afterward could ever fix
 * that. A model shown only the assertion and the method adjacent to it has
 * no way to discover this; it can only see the method's NAME, which
 * describes intent, not what the code actually does. Nothing here is
 * specific to this test or this bug shape — it surfaces every step's real
 * implementation so that class of mismatch is visible whenever it recurs.
 */
function addTestFlowSources(files, test, { maxMethods = 8 } = {}) {
  const calls = listTestBodyCalls(test);
  if (!calls.length) return files;

  // Closest to the failure first: most likely to be the relevant precondition,
  // and this order is what the budget below spends on when a test has many steps.
  const byDistance = [...calls].sort((a, b) => b.line - a.line);
  const seen = new Set();
  let budget = maxMethods;

  for (const call of byDistance) {
    if (budget <= 0) break;
    const key = `${call.receiver || ''}.${call.method}`;
    if (seen.has(key)) continue;
    seen.add(key);

    for (const candidatePath of listHelperFiles()) {
      let content;
      try {
        content = fs.readFileSync(candidatePath, 'utf-8');
      } catch {
        continue;
      }
      const declLine = findDeclarationLine(content, call.method);
      if (declLine == null) continue;
      const span = functionSpan(content, declLine);
      const anchors = [];
      for (let ln = span.start; ln <= span.end; ln += 1) anchors.push(ln);
      addOrWidenFile(files, candidatePath, anchors);
      budget -= 1;
      break; // a name should only be declared once
    }
  }

  return files;
}

module.exports = {
  resolveEditableFile,
  collectCandidateFiles,
  describeFailingLines,
  describeAssertionContext,
  addErrorLiteralMatches,
  addCalledMethodSources,
  listTestBodyCalls,
  addTestFlowSources,
  buildExcerpt,
  normalizeEol,
  applyEol,
  EDITABLE_ROOTS,
  // Exported for ./swallowedFailures.js, which re-walks the same
  // assertion→method trace to inspect that method's error handling.
  resolveAssertedCallee,
  listHelperFiles,
  findDeclarationLine,
  functionSpan,
};
