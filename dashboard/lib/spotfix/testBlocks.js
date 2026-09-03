/**
 * Finds the line range of the Playwright test containing a given line.
 * Shared between index.js (disambiguating a repeated snippet) and
 * sourceFiles.js (reading a test's full assertion sequence) — both need to
 * answer "what test is this line actually inside," and a fixed line radius
 * doesn't work for either: assertions in these spec files repeat every
 * 11-42 lines, so any window wide enough to reach a target also catches its
 * neighbours. The test declaration is the real boundary.
 */

// A test/describe declaration, which is what bounds one test's body.
const TEST_DECLARATION = /^\s*(?:test|it|describe)\s*(?:\.\s*\w+\s*)*\(/;

/** The 1-based { start, end } line range of the test containing `anchorLine`, or null if not inside one. */
function enclosingTestBlock(lines, anchorLine) {
  let start = 0;
  for (let i = Math.min(anchorLine, lines.length) - 1; i >= 0; i -= 1) {
    if (TEST_DECLARATION.test(lines[i])) {
      start = i + 1; // 1-based
      break;
    }
  }
  if (!start) return null;

  let end = lines.length + 1;
  for (let i = start; i < lines.length; i += 1) {
    if (TEST_DECLARATION.test(lines[i])) {
      end = i + 1;
      break;
    }
  }
  return { start, end };
}

module.exports = { TEST_DECLARATION, enclosingTestBlock };
