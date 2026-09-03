/**
 * What kind of problem a failure is. This is the gate for the spot-fix
 * feature: editing source only makes sense for 'code', and offering a code
 * edit for an Akamai block or a DNS failure would be actively misleading —
 * the model would happily invent a selector change for a page that never
 * loaded.
 *
 *   code           — the test/page-object source is wrong: stale selector,
 *                    wrong expected text, missing wait. Fixable by editing
 *                    files in this repo.
 *   environment    — config/data/credentials/connectivity for the run.
 *                    Nothing in the repo to change.
 *   infrastructure — outside the repo and outside the run's control: CDN or
 *                    bot-detection blocks, browser launch failures.
 *   unknown        — not enough signal to classify; needs a human.
 */
const CATEGORIES = ['code', 'environment', 'infrastructure', 'unknown'];

const FIXABLE_CATEGORY = 'code';

/** Coerces free-form model output (e.g. "Code", "code issue") to a known category. */
function normalizeCategory(raw) {
  if (!raw) return 'unknown';
  const text = String(raw).trim().toLowerCase();
  const exact = CATEGORIES.find((c) => c === text);
  if (exact) return exact;
  // Substring match so a model answering "code (stale selector)" still lands.
  const partial = CATEGORIES.find((c) => text.includes(c));
  return partial || 'unknown';
}

module.exports = { CATEGORIES, FIXABLE_CATEGORY, normalizeCategory };
