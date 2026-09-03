/**
 * Understands how a page object declares a locator — in either dialect this
 * codebase's own standards allow.
 *
 * The engine used to recognise exactly one shape:
 *
 *     this.playButton = { selector: '.play-btn' };
 *
 * matched by a single regex looking for `selector:`. That is the shape 238 of
 * this repo's locators happen to use, but `.mcp-context/skills/locator.skill.md`
 * *mandates* the other one:
 *
 *     this.loginButton = page.getByRole('button', { name: 'Login' });
 *
 * and 69 locators already use it. Every locator written the way the standard
 * requires was invisible to three separate mechanisms at once — the grounding
 * catalog, the live selector probe, and MCP healing — so a page object written
 * correctly got *less* help from the fixer than one written against the
 * standard. This module is the single place that knows both, so adding a third
 * dialect is one change here rather than four across the pipeline.
 *
 * Nothing here evaluates source. A chain is parsed into a list of plain
 * `{ kind, value, options }` steps that liveProbe.js reassembles into a real
 * Locator through a fixed switch — a proposal can name a locator, never run
 * one.
 */

// --- literal scanning -------------------------------------------------------

const QUOTES = new Set(["'", '"', '`']);

/**
 * Index just past the string literal starting at `i` (which must be a quote),
 * honouring backslash escapes. Template literals are scanned the same way;
 * whether one contains `${}` is decided separately, by the caller.
 */
function endOfString(text, i) {
  const quote = text[i];
  for (let j = i + 1; j < text.length; j += 1) {
    if (text[j] === '\\') {
      j += 1;
      continue;
    }
    if (text[j] === quote) return j + 1;
  }
  return text.length;
}

/** Index just past a regex literal starting at `i` (which must be `/`). */
function endOfRegex(text, i) {
  let inClass = false;
  for (let j = i + 1; j < text.length; j += 1) {
    const ch = text[j];
    if (ch === '\\') {
      j += 1;
      continue;
    }
    if (ch === '[') inClass = true;
    else if (ch === ']') inClass = false;
    else if (ch === '/' && !inClass) {
      let k = j + 1;
      while (k < text.length && /[a-z]/i.test(text[k])) k += 1;
      return k;
    } else if (ch === '\n') return -1; // unterminated: not a regex after all
  }
  return -1;
}

/**
 * A `/` starts a regex (rather than division) only where a value is expected.
 * Inside a locator chain that means directly after `(`, `,`, `:`, `[` or `=`,
 * which is every position an argument can appear in.
 */
function regexStartsHere(text, i) {
  for (let k = i - 1; k >= 0; k -= 1) {
    const ch = text[k];
    if (/\s/.test(ch)) continue;
    return '(,:[=&|!?{'.includes(ch);
  }
  return true;
}

/**
 * Index just past the balanced bracket group starting at `open`, skipping over
 * strings, template literals, regexes and comments so a `)` inside a quoted
 * selector never ends the group early.
 */
function endOfGroup(text, open) {
  const pairs = { '(': ')', '{': '}', '[': ']' };
  const closer = pairs[text[open]];
  if (!closer) return -1;
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    const ch = text[i];
    if (QUOTES.has(ch)) {
      i = endOfString(text, i) - 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      if (nl === -1) return -1;
      i = nl;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i);
      if (end === -1) return -1;
      i = end + 1;
      continue;
    }
    if (ch === '/' && regexStartsHere(text, i)) {
      const end = endOfRegex(text, i);
      if (end !== -1) {
        i = end - 1;
        continue;
      }
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1;
    else if (ch === ')' || ch === '}' || ch === ']') {
      depth -= 1;
      if (depth === 0) return i + 1;
      if (depth < 0) return -1;
    }
  }
  return -1;
}

/** Splits `a, b, c` at top-level commas only. */
function splitArgs(inner) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (QUOTES.has(ch)) {
      i = endOfString(inner, i) - 1;
      continue;
    }
    if (ch === '/' && regexStartsHere(inner, i)) {
      const end = endOfRegex(inner, i);
      if (end !== -1) {
        i = end - 1;
        continue;
      }
    }
    if ('({['.includes(ch)) depth += 1;
    else if (')}]'.includes(ch)) depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  const tail = inner.slice(start);
  if (tail.trim() || parts.length) parts.push(tail);
  return parts.map((p) => p.trim()).filter((p) => p.length);
}

/**
 * One argument as a plain, serializable value.
 *
 * `dynamic` is the important case and is never guessed around: a selector
 * built from a variable or an interpolated template has no fixed value, so it
 * cannot be probed against a live page and must not be reported as "matches
 * nothing" — that would be a false accusation against a perfectly good locator.
 */
function parseValue(raw) {
  const text = raw.trim();
  if (!text) return { type: 'dynamic', raw: text };

  if (QUOTES.has(text[0]) && endOfString(text, 0) === text.length) {
    const body = text.slice(1, -1);
    if (text[0] === '`' && /\$\{/.test(body)) return { type: 'dynamic', raw: text };
    return { type: 'string', value: body.replace(/\\(['"`\\])/g, '$1') };
  }

  if (text[0] === '/') {
    const end = endOfRegex(text, 0);
    if (end === text.length) {
      const lastSlash = text.lastIndexOf('/');
      return { type: 'regex', source: text.slice(1, lastSlash), flags: text.slice(lastSlash + 1) };
    }
  }

  if (text === 'true' || text === 'false') return { type: 'boolean', value: text === 'true' };
  if (/^-?\d+(?:\.\d+)?$/.test(text)) return { type: 'number', value: Number(text) };
  if (text[0] === '{') return { type: 'object', entries: parseObjectLiteral(text) };

  return { type: 'dynamic', raw: text };
}

/** `{ name: 'Login', exact: true }` -> { name: {...}, exact: {...} }. Shorthand and spreads become dynamic. */
function parseObjectLiteral(text) {
  const open = text.indexOf('{');
  const close = endOfGroup(text, open);
  if (open === -1 || close === -1) return {};
  const entries = {};
  for (const part of splitArgs(text.slice(open + 1, close - 1))) {
    const colon = (() => {
      let depth = 0;
      for (let i = 0; i < part.length; i += 1) {
        const ch = part[i];
        if (QUOTES.has(ch)) {
          i = endOfString(part, i) - 1;
          continue;
        }
        if ('({['.includes(ch)) depth += 1;
        else if (')}]'.includes(ch)) depth -= 1;
        else if (ch === ':' && depth === 0) return i;
      }
      return -1;
    })();
    if (colon === -1) continue; // shorthand / spread — no literal value to read
    const key = part.slice(0, colon).trim().replace(/^['"`]|['"`]$/g, '');
    if (key) entries[key] = parseValue(part.slice(colon + 1));
  }
  return entries;
}

// --- builder chains ---------------------------------------------------------

// Playwright's locator builders, mapped to the `kind` liveProbe switches on.
const BUILDER_KINDS = {
  locator: 'css',
  getByRole: 'role',
  getByText: 'text',
  getByLabel: 'label',
  getByPlaceholder: 'placeholder',
  getByAltText: 'altText',
  getByTitle: 'title',
  getByTestId: 'testId',
  frameLocator: 'frame',
};
// Refinements that narrow an existing locator rather than creating one.
const REFINEMENT_KINDS = { filter: 'filter', first: 'first', last: 'last', nth: 'nth' };
// Actions and queries performed ON a locator. Reaching one means the locator
// itself is complete and still perfectly probeable — only the part after it is
// not a locator. Treating these as "unrecognised" would throw away every
// inline `page.getByRole(...).click()`, which is most of how locators appear
// outside a page object's constructor.
const TERMINAL_METHODS = new Set([
  'click', 'dblclick', 'fill', 'type', 'press', 'pressSequentially', 'hover', 'tap',
  'check', 'uncheck', 'setChecked', 'selectOption', 'selectText', 'setInputFiles',
  'focus', 'blur', 'clear', 'dragTo', 'scrollIntoViewIfNeeded', 'highlight',
  'waitFor', 'screenshot', 'boundingBox', 'elementHandle', 'elementHandles', 'all',
  'count', 'textContent', 'allTextContents', 'innerText', 'allInnerTexts', 'innerHTML',
  'inputValue', 'getAttribute', 'isVisible', 'isHidden', 'isEnabled', 'isDisabled',
  'isChecked', 'isEditable', 'evaluate', 'evaluateAll', 'ariaSnapshot',
]);

const CHAIN_ROOT_RE = /^(?:this\.)?(?:page|frame)\b/;

/**
 * Parses `page.getByRole('button', { name: 'Login' }).first()` into ordered
 * steps. Returns null when the expression is not a locator chain at all.
 */
function parseChain(expr) {
  const text = expr.trim();
  if (!CHAIN_ROOT_RE.test(text)) return null;

  const steps = [];
  let probeable = true;
  let i = text.search(/\bpage\b|\bframe\b/);
  i = text.indexOf('.', i);
  // How much of `text` the chain actually occupies. Matters when parsing an
  // inline chain out of a larger snippet: without it `raw` would run to the
  // end of the surrounding statement (or file) rather than the locator.
  let consumedEnd = i;

  while (i !== -1 && i < text.length) {
    const rest = text.slice(i + 1);
    const nameMatch = rest.match(/^\s*(\w+)\s*\(/);
    if (!nameMatch) break;

    const method = nameMatch[1];
    const open = i + 1 + nameMatch[0].lastIndexOf('(');
    const close = endOfGroup(text, open);
    if (close === -1) break;

    const args = splitArgs(text.slice(open + 1, close - 1)).map(parseValue);
    const kind = BUILDER_KINDS[method] || REFINEMENT_KINDS[method];

    if (!kind) {
      // An action/query ends the locator cleanly; anything else is a project
      // helper this cannot reproduce faithfully, so what follows is unknown
      // and the chain stops being safe to probe.
      if (!TERMINAL_METHODS.has(method)) probeable = false;
      break;
    }

    const step = { kind };
    if (kind === 'nth') {
      const n = args[0];
      if (n?.type === 'number') step.index = n.value;
      else probeable = false;
    } else if (kind === 'filter') {
      const opts = args[0]?.type === 'object' ? args[0].entries : null;
      if (opts && (opts.hasText || opts.hasNotText)) {
        step.options = {};
        if (opts.hasText) step.options.hasText = opts.hasText;
        if (opts.hasNotText) step.options.hasNotText = opts.hasNotText;
        if ([opts.hasText, opts.hasNotText].some((v) => v && v.type === 'dynamic')) probeable = false;
      } else {
        // filter({ has: locator }) — a nested locator this cannot rebuild.
        probeable = false;
      }
    } else if (kind === 'first' || kind === 'last') {
      // no arguments
    } else {
      const primary = args[0];
      if (!primary || primary.type === 'dynamic') probeable = false;
      else step.value = primary;
      const opts = args[1]?.type === 'object' ? args[1].entries : null;
      if (opts) {
        step.options = opts;
        if (Object.values(opts).some((v) => v.type === 'dynamic')) probeable = false;
      }
    }

    steps.push(step);
    i = close;
    consumedEnd = close;
    if (text[i] !== '.') break;
  }

  if (!steps.length) return null;
  return { dialect: 'builder', steps, probeable, raw: text.slice(0, consumedEnd).trim() };
}

// --- PageElement object dialect --------------------------------------------

const PAGE_ELEMENT_KEYS = ['testId', 'role', 'text', 'selector'];

/**
 * Parses `{ selector: '.x', text: 'Play' }` into the same step shape.
 *
 * The precedence mirrors the resolver these objects are actually passed to
 * (testId, then role+text, then text, then selector — see getLocator in
 * src/utils/page-utils.ts). Probing the `selector` unconditionally, as the
 * pipeline used to, checks a field the app never reads whenever a testId or
 * text is also set: a locator that works fine at runtime would be reported as
 * matching nothing live.
 */
function parsePageElement(expr) {
  const text = expr.trim();
  if (text[0] !== '{') return null;
  const entries = parseObjectLiteral(text);
  const present = PAGE_ELEMENT_KEYS.filter((k) => entries[k]);
  if (!present.length) return null;

  let step = null;
  let probeable = true;
  const dynamic = (v) => !v || v.type === 'dynamic';

  if (entries.testId) {
    step = { kind: 'testId', value: entries.testId };
    probeable = !dynamic(entries.testId);
  } else if (entries.role && entries.text) {
    step = { kind: 'role', value: entries.role, options: { name: entries.text } };
    probeable = !dynamic(entries.role) && !dynamic(entries.text);
  } else if (entries.text) {
    step = { kind: 'text', value: entries.text };
    probeable = !dynamic(entries.text);
  } else {
    step = { kind: 'css', value: entries.selector };
    probeable = !dynamic(entries.selector);
  }

  return { dialect: 'pageElement', steps: [step], probeable, raw: text, fields: entries };
}

function parseLocatorExpression(expr) {
  return parsePageElement(expr) || parseChain(expr);
}

// --- declarations -----------------------------------------------------------

// `this.name = <expr>` (constructor assignment) or `name = <expr>` /
// `readonly name = <expr>` (class field initializer). Both are ways the same
// class exposes the same locator.
// Anchored to a statement boundary — start of input, newline, `;` or `{` —
// rather than to a newline alone, so a declaration that shares a line with
// the brace that opens its constructor is still found.
// The optional `: Type` annotation deliberately cannot cross a statement or
// bracket boundary. Allowing it to swallow anything up to the next `=` made a
// key inside a locator's own options object (`{ name: 'Login' }`) look like
// the start of the NEXT declaration, mislabelling it.
const DECL_RE = /(?:^|[\n;{])\s*(?:(?:private|public|protected|readonly|static)\s+)*(?:this\.)?(\w+)(?:\s*:\s*[^=;{}()\n]+?)?\s*=\s*(?=[{a-zA-Z_$])/g;

const lineAt = (content, index) => content.slice(0, index).split('\n').length;

/** Collapsed one-line rendering of a declaration, for prompt catalogs. */
function describeLocator(descriptor) {
  const raw = (descriptor.raw || '').replace(/\s+/g, ' ').trim();
  return raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
}

/**
 * Every locator a file declares, in either dialect:
 * [{ name, line, dialect, steps, probeable, raw }]
 */
function parseLocatorDeclarations(content) {
  const found = [];
  const seen = new Set();
  DECL_RE.lastIndex = 0;
  for (const match of content.matchAll(DECL_RE)) {
    const name = match[1];
    const valueStart = match.index + match[0].length;
    // Read to the end of the initializer: a balanced group, or the rest of
    // the statement for a chain.
    let expr;
    if (content[valueStart] === '{') {
      const close = endOfGroup(content, valueStart);
      if (close === -1) continue;
      expr = content.slice(valueStart, close);
    } else {
      const semi = content.indexOf(';', valueStart);
      const nl = content.indexOf('\n', valueStart);
      // A chain can span lines; a `;` ends it definitively, otherwise take the
      // balanced extent of whatever call group opens first.
      let end = semi === -1 ? content.length : semi;
      if (nl !== -1 && nl < end) {
        const open = content.indexOf('(', valueStart);
        const close = open !== -1 && open < end ? endOfGroup(content, open) : -1;
        if (close === -1) end = nl;
      }
      expr = content.slice(valueStart, end);
    }

    const parsed = parseLocatorExpression(expr);
    if (!parsed) continue;
    const key = `${name}@${lineAt(content, valueStart)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({ name, line: lineAt(content, valueStart), ...parsed });
  }
  return found;
}

/**
 * Locator expressions appearing anywhere in an arbitrary snippet — used on an
 * edit's oldCode/newCode, where the interesting locator is often written
 * inline rather than as a named declaration.
 */
function extractLocatorExpressions(code) {
  if (!code) return [];
  const out = [...parseLocatorDeclarations(code)];
  const covered = new Set(out.map((d) => d.raw));

  // Bare inline chains: `await this.page.getByRole('button').click()`.
  const CHAIN_START = /(?:this\.)?\bpage\s*\.\s*(?:locator|getBy\w+|frameLocator)\s*\(/g;
  for (const m of code.matchAll(CHAIN_START)) {
    const parsed = parseChain(code.slice(m.index));
    if (!parsed || covered.has(parsed.raw)) continue;
    // parseChain keeps trailing text; re-derive a tight raw from the steps it
    // actually consumed so the rendering isn't the rest of the file.
    covered.add(parsed.raw);
    out.push({ name: null, line: lineAt(code, m.index), ...parsed });
  }
  return out;
}

/** Serializable instruction set for liveProbe.js — never source text to evaluate. */
function toProbeSpec(descriptor) {
  if (!descriptor?.probeable || !descriptor.steps?.length) return null;
  const steps = [];
  for (const step of descriptor.steps) {
    const out = { kind: step.kind };
    if (step.value) {
      if (step.value.type === 'string') out.value = step.value.value;
      else if (step.value.type === 'regex') out.regex = { source: step.value.source, flags: step.value.flags };
      else return null;
    }
    if (typeof step.index === 'number') out.index = step.index;
    if (step.options) {
      out.options = {};
      for (const [key, val] of Object.entries(step.options)) {
        if (val.type === 'string') out.options[key] = val.value;
        else if (val.type === 'boolean' || val.type === 'number') out.options[key] = val.value;
        else if (val.type === 'regex') out.options[key] = { __regex: { source: val.source, flags: val.flags } };
        else return null;
      }
    }
    steps.push(out);
  }
  return { steps, label: describeLocator(descriptor) };
}

// --- relating locators to the code being changed ----------------------------

// Words that carry no meaning when matching a method name against a locator
// name — nearly every accessor contains one.
const NAME_STOPWORDS = new Set([
  'is', 'get', 'set', 'has', 'click', 'tap', 'visible', 'displayed', 'shown', 'element',
  'button', 'btn', 'the', 'and', 'for', 'from', 'with', 'page', 'wait', 'check', 'verify',
  'locator', 'text', 'value', 'first', 'async', 'this', 'icon',
  // Two-letter grammatical filler, admitted once nameTokens stopped
  // discarding everything of length <= 2 (that cutoff was dropping real
  // words like "go"). These carry no subject meaning — without them
  // `addToWatchlistButton` tokenises as [add, to, watchlist], and the
  // stray "to" dilutes the specificity ratio that decides which locator is
  // most on-subject, for no reason. Words that ARE meaningful at two
  // letters ("go", "ok", "id", "no") are deliberately not listed.
  'to', 'my', 'of', 'in', 'on', 'at', 'by', 'as', 'or', 'an', 'if', 'be', 'it', 'we', 'us', 'do',
]);

/**
 * Meaningful concept words in an identifier: `isLiveIconVisible` -> ['live'].
 *
 * The length cutoff was `t.length > 2` and it was a real bug, not a
 * simplification: it silently dropped "go" from `goLiveButton` (2 letters)
 * while keeping "tag" from `liveTag` (3 letters), so `goLiveButton`
 * collapsed to just `['live']` — a "100% match" against a method wanting
 * "live" — while `liveTag` scored only 50% for having a second real word
 * survive filtering. That inverted the ranking specificity() is FOR: it made
 * a locator about an unrelated control (a "go live" jump-to-edge button)
 * outrank the one actually about the live-status concept, purely because of
 * which of its words happened to be short enough to vanish. Real incident:
 * this is why `this.goLiveButton` kept out-ranking `this.liveTag` as the
 * "related" locator for `isLiveIconVisible()`, even though `goLiveButton`
 * is a different element doing a different job. Only single-character
 * fragments are noise; two-letter real words ("go", "id", "ok") are not.
 */
function nameTokens(name) {
  return String(name || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !NAME_STOPWORDS.has(t));
}

// Covers both dialects this repo actually uses: class methods
// (`private async foo(): Promise<x> {`) and the standalone exported
// functions business functions are written as
// (`export async function verifyX(page: any, input: Y) {`). Without the
// export/function prefixes the latter matched nothing, so every anchor in a
// business function fell back to the nearest `if` — and once that was
// excluded, to nothing at all.
const METHOD_SIGNATURE_RE =
  /^\s*(?:export\s+)?(?:default\s+)?(?:private\s+|public\s+|protected\s+)?(?:static\s+)?(?:async\s+)?(?:function\s+)?(\w+)\s*\([^)]*\)\s*(?::[^{]+)?\{/gm;

/**
 * Control-flow keywords that are shaped exactly like a method signature —
 * `if (cond) {`, `catch (e) {`, `while (x) {`. Without excluding them,
 * enclosingMethodName reports the nearest `if` as the "method" a line sits
 * in, which is what happened for every anchor inside a business function
 * here: 33 anchors in ott-watchlist-bfs.ts all resolved to a method named
 * "if". Anything keyed off that name — the related-locator ranking, the
 * relevance targets, the prompt's own "the failure is inside X()" line —
 * then describes a function that does not exist.
 */
const CONTROL_KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'do', 'else', 'return', 'with', 'function']);

/**
 * Name of the method containing `offset` — the nearest preceding signature.
 * `offset` must index the SAME string passed in (callers working from an
 * edit's startOffset must normalize line endings first; see layering.js).
 */
function enclosingMethodName(content, offset) {
  METHOD_SIGNATURE_RE.lastIndex = 0;
  const before = content.slice(0, offset);
  const matches = [...before.matchAll(METHOD_SIGNATURE_RE)].filter((m) => !CONTROL_KEYWORDS.has(m[1]));
  return matches.length ? matches[matches.length - 1][1] : null;
}

/**
 * Locators declared in `content` whose names relate to `methodName`, best
 * first: [{ name, selector, overlap, specificity }].
 *
 * Ranked by how much of the CANDIDATE's name the shared concept accounts for,
 * not by raw overlap. Against `isLiveIconVisible` every locator containing
 * "live" shares exactly one token, which leaves ordering to chance and buries
 * `liveTag` and `goLiveButton` — the two that were actually correct — under
 * `liveChannelsTray`. A locator that is *entirely* about the shared concept is
 * the better suggestion.
 */
function relatedLocators(content, methodName, { limit = 4 } = {}) {
  const wanted = new Set(nameTokens(methodName));
  if (!wanted.size) return [];
  return parseLocatorDeclarations(content)
    .map((decl) => {
      const tokens = nameTokens(decl.name);
      const overlap = tokens.filter((t) => wanted.has(t)).length;
      return {
        name: decl.name,
        selector: describeLocator(decl),
        overlap,
        specificity: tokens.length ? overlap / tokens.length : 0,
      };
    })
    .filter((c) => c.overlap > 0)
    .sort((a, b) => b.specificity - a.specificity || b.overlap - a.overlap || a.name.length - b.name.length)
    .slice(0, limit);
}

/**
 * Turns a verified candidate's builder form (`getByText('Live', { exact: true })`
 * — see ./candidates.js) into a Playwright selector-engine string usable
 * wherever this repo passes a raw string: `page.locator(x)` and the
 * `{ selector: '...' }` field of a PageElement.
 *
 * This is what lets a repair target the DECLARATION at the top of a class
 * rather than inlining a locator into a method. The declaration is where the
 * project's standards say a locator lives, and it is also the shape 213 of
 * this repo's 254 locator-construction lines actually use
 * (`this.page.locator(this.x.selector)`), so without a translation step a
 * deterministic repair could only ever reach the ~2% written as inline
 * literals.
 *
 * Every mapping below is a documented Playwright engine form, not an
 * invention — but a translation is still a claim about behaviour, so callers
 * MUST resolve the result against the captured page and require exactly one
 * match before offering it (see verifySelectorString in ./index.js). Returns
 * null for anything not confidently expressible, which is a signal to fall
 * back rather than guess.
 */
function candidateToSelectorString(builder) {
  const call = String(builder || '').match(/^(\w+)\((.*)\)$/s);
  if (!call) return null;
  const [, method, argsRaw] = call;
  const firstArg = argsRaw.match(/^'((?:\\.|[^'])*)'/);
  if (!firstArg) return null;
  const value = firstArg[1].replace(/\\(['\\])/g, '$1');
  const nameMatch = argsRaw.match(/name:\s*'((?:\\.|[^'])*)'/);
  const name = nameMatch ? nameMatch[1].replace(/\\(['\\])/g, '$1') : null;
  const exact = /exact:\s*true/.test(argsRaw);
  // Attribute values go inside double quotes, so a double quote or backslash
  // in the value has to be escaped or the selector silently changes meaning.
  const attr = (v) => String(v).replace(/(["\\])/g, '\\$1');

  switch (method) {
    case 'getByTestId': return `[data-testid="${attr(value)}"]`;
    case 'getByLabel': return `[aria-label="${attr(value)}"]`;
    case 'getByPlaceholder': return `[placeholder="${attr(value)}"]`;
    case 'getByAltText': return `[alt="${attr(value)}"]`;
    case 'getByTitle': return `[title="${attr(value)}"]`;
    // Playwright's text engine treats a QUOTED string as an exact,
    // whitespace-normalised match and a bare one as a substring match — which
    // is exactly the distinction `exact: true` draws in the builder API.
    case 'getByText': return exact ? `text="${attr(value)}"` : `text=${value}`;
    case 'getByRole':
      if (!name) return `role=${value}`;
      return `role=${value}[name="${attr(name)}"]${exact ? '[exact=true]' : ''}`;
    case 'locator': return value;
    default: return null;
  }
}

/** Which dialect a body of source predominantly uses — shapes prompt wording. */
function detectDialect(contents) {
  let pageElement = 0;
  let builder = 0;
  for (const content of contents) {
    for (const decl of parseLocatorDeclarations(content)) {
      if (decl.dialect === 'pageElement') pageElement += 1;
      else builder += 1;
    }
  }
  if (!pageElement && !builder) return 'unknown';
  if (pageElement && builder) return 'mixed';
  return pageElement ? 'pageElement' : 'builder';
}

module.exports = {
  parseLocatorDeclarations,
  parseLocatorExpression,
  extractLocatorExpressions,
  toProbeSpec,
  describeLocator,
  detectDialect,
  nameTokens,
  enclosingMethodName,
  relatedLocators,
  candidateToSelectorString,
  // exported for reuse by the layering checks
  endOfGroup,
  splitArgs,
  parseObjectLiteral,
  BUILDER_KINDS,
};
