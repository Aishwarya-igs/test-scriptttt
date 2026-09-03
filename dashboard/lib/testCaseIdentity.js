/**
 * A stable identity for a test CASE, as opposed to one run's record of it.
 *
 * `test.file:line` (what priorAttempts.js used until now) breaks the moment
 * the source file is refactored or a test is added/removed above it and
 * every subsequent line number shifts — at which point "prior attempts for
 * this test" silently stops finding anything, with no error, just quietly
 * losing history. This repo's test titles carry a much better identity for
 * free: a ticket id ("IW3-T2047") that survives the file being rewritten
 * entirely, as long as the title itself isn't renamed. Verified against the
 * whole suite: 144 of 145 tests carry one; the one that doesn't falls back
 * to file:line exactly as before, so nothing regresses for it.
 */
const TICKET_ID_RE = /\b([A-Z]{2,}\d*-T?\d+)\b/;

function testCaseKey(test) {
  const match = String(test?.title || '').match(TICKET_ID_RE);
  if (match) return match[1];
  // Fallback for the rare test with no ticket id in its title — same
  // identity priorAttempts.js used before this existed.
  return `${test?.file}:${test?.line}`;
}

module.exports = { testCaseKey, TICKET_ID_RE };
