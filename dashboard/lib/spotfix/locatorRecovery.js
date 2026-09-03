/**
 * Recovers a model's paraphrased locator-declaration line back to the file's
 * real text, instead of rejecting the whole edit.
 *
 * Root cause, found by tracing a real "the model may have paraphrased it"
 * rejection back through the actual prompt sent: a page object too big to
 * show in full (OTTAuthPage.ts is 1442 lines; the excerpt is a ~50-line
 * window around whichever method actually failed) declares its locators at
 * the class top, often 100+ lines from the method that uses them — outside
 * that window. The model's only view of such a locator is the compact
 * catalog line (see ./locatorIndex.js, describeLocator in ./locatorSyntax.js):
 *
 *     this.emailErrorMessage → { selector: 'form', text: '...' }
 *
 * built for reading, not for being copied back as `oldCode` — it collapses
 * whitespace and drops the `this.x = ` / `;` the real statement has. A model
 * that treats it as the line's content (a reasonable thing to do; it IS
 * being shown as that locator's authoritative description) produces an
 * `oldCode` that cannot byte-match the file, no matter how careful it is.
 * That was rejecting fixes whose actual intent — which locator, what new
 * value — was completely legible.
 *
 * ../prompt.js now also widens the excerpt to include real source for any
 * locator it names as relevant, which prevents most of this. This is the
 * backstop for what that widening doesn't cover — a locator reached for from
 * the full catalog outside the "related" set, or a differently-shaped
 * mismatch — so it stays deliberately narrow: a line is only ever replaced
 * when the name it references is declared as a single-line statement
 * EXACTLY ONCE in the real file. An ambiguous or multi-line declaration is
 * left alone and falls through to the original rejection — this recovers
 * formatting drift on an unambiguous target, it never guesses at content
 * that isn't verbatim in the file.
 */

// A single-line `this.name = <anything>;` statement — the shape every
// locator in the PageElement dialect takes, and the one whose collapsed
// catalog rendering loses its literal form.
const LOCATOR_LINE_RE = /^\s*this\.(\w+)\s*=.*;\s*$/;

/** The file's real text for `this.<name> = ...;`, or null if it's not a single unambiguous single-line statement. */
function findRealDeclarationLine(contentLines, name) {
  const re = new RegExp(`^\\s*this\\.${name}\\s*=.*;\\s*$`);
  const matches = contentLines.filter((line) => re.test(line));
  return matches.length === 1 ? matches[0] : null;
}

/**
 * Attempts to repair `oldCode`/`newCode` by swapping any paraphrased
 * `this.name = ...;` line for the file's real text.
 *
 * A line only ever changes when it resolves unambiguously; every replacement
 * is one this function can point to a specific real line for, which is what
 * `corrections` reports back for the diff review to show — this rewrites
 * formatting, never invents behaviour.
 *
 * Returns null when nothing needed fixing (either every line already
 * matched, or no line was recoverable) — callers should treat null as "no
 * change", not as failure.
 */
function recoverParaphrasedLocatorLines(content, oldCode, newCode) {
  const contentLines = content.split('\n');
  const oldLines = oldCode.split('\n');
  const oldLineSet = new Set(oldLines);
  const corrections = [];

  const correctedOldLines = oldLines.map((line) => {
    const m = line.match(LOCATOR_LINE_RE);
    if (!m) return line;
    const real = findRealDeclarationLine(contentLines, m[1]);
    if (!real || real === line) return line;
    corrections.push({ name: m[1], from: line.trim(), to: real.trim() });
    return real;
  });
  if (!corrections.length) return null;

  // A newCode line only gets corrected when it is UNCHANGED context — i.e.
  // it also appeared byte-identical in the raw oldCode. That means the model
  // referenced this locator without intending to change it (grabbed as
  // context, or for uniqueness). A line that differs from every oldCode line
  // is the model's actual edit — its value is the point of the proposal, and
  // is left exactly as written even if its formatting also drifted, since
  // "what should this become" is the one thing only the model gets to decide.
  const correctedNewLines = newCode.split('\n').map((line) => {
    if (!oldLineSet.has(line)) return line;
    const m = line.match(LOCATOR_LINE_RE);
    if (!m) return line;
    const real = findRealDeclarationLine(contentLines, m[1]);
    return real && real !== line ? real : line;
  });

  return { oldCode: correctedOldLines.join('\n'), newCode: correctedNewLines.join('\n'), corrections };
}

module.exports = { recoverParaphrasedLocatorLines };
