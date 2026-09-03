/**
 * The last DOM each test case was seen passing with.
 *
 * Everything else in this pipeline observes only broken pages. That is the
 * root limitation behind the worst fixes it has produced: shown a failing
 * page and asked what a stale locator should become, a model can only pick
 * something that IS on that page, and both a `<title>` string and a generic
 * `videoPlayer` qualify. Nothing in the evidence contradicted either, because
 * the evidence never included what the locator matched back when it worked.
 *
 * A passing snapshot changes the question from "what here might be the live
 * indicator?" to "which element here best matches the one this locator
 * resolved to when the test passed?" — a comparison against recorded reality
 * instead of a guess.
 *
 * Keyed by testCaseKey (a ticket id like IW3-T2047 where one exists), not by
 * file:line, so a baseline survives the spec being reordered or rewritten —
 * the same identity cross-run history already uses. Exactly one baseline is
 * kept per test case: the newest passing one. Older ones describe a page that
 * no longer exists, and keeping them would just be a slower way of being
 * wrong.
 */
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('../paths');
const { testCaseKey } = require('../testCaseIdentity');

const BASELINE_DIR = path.join(DATA_DIR, 'dom-baselines');

const safeName = (key) => `${String(key).replace(/[^a-zA-Z0-9._-]/g, '_')}.json`;

// Every real capture this pipeline has ever recorded from this app has been
// tens of kilobytes (a live SPA page, not a hand-written snippet). A file
// far below that is not a smaller version of the same thing — it is either a
// truncated write or hand-authored fixture data that ended up in this
// directory by accident. Trusting it is worse than having no baseline at
// all: candidate ranking would fingerprint against an element that was never
// real and confidently reject or endorse replacements on that basis. This
// happened once already — see the T2047 incident this guard was added for.
const MIN_PLAUSIBLE_HTML_LENGTH = 2000;

function ensureDir() {
  try {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Records this test's `dom-baseline` attachment as the current baseline, if it
 * passed and produced one.
 *
 * Copies the content rather than pointing at the run's artifact directory: a
 * baseline has to outlive the run that produced it, and run artifacts are
 * pruned. Best-effort throughout — a baseline is an optimisation, and failing
 * to store one must never disturb recording the run itself.
 *
 * Whether a pass EARNED its baseline cannot be decided here. A verification
 * rerun is a separate run: the baseline is written from the rerun's own test
 * record at test-end, while the verdict on it is resolved after that run
 * finishes and is stored on the SOURCE run's record. At the moment this is
 * called the rerun's record carries no spotFix and no verification at all, so
 * an inconclusive result is simply not knowable yet. (An earlier version of
 * this function checked `test.spotFix.verification.status` right here; that
 * check inspected the wrong record at the wrong time and could never fire.)
 *
 * `recordedByRunId` is stamped so the decision can be revisited once the
 * verdict exists — see discardBaselineFromRun, which the verification
 * resolver calls to take the baseline back when a pass turns out not to
 * confirm anything. That matters because a baseline is reference data: an
 * ambiguous locator once passed by luck of a positional .first() pick, that
 * page was stored as the baseline, and every later candidate ranking then
 * treated the WRONG element as the known-good target — turning one bad fix
 * into permanent evidence that argued for repeating it.
 */
function recordBaseline(test, { runId = null } = {}) {
  if (test?.status !== 'passed') return null;
  const attachment = (test.attachments || []).find((a) => a.name === 'dom-baseline' && a.path);
  if (!attachment) return null;

  const key = testCaseKey(test);
  if (!key || !ensureDir()) return null;

  try {
    const raw = fs.readFileSync(attachment.path, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.html !== 'string') return null;

    const record = {
      testCaseKey: key,
      title: test.title || '',
      url: typeof parsed.url === 'string' ? parsed.url : null,
      html: parsed.html,
      capturedAt: new Date().toISOString(),
      recordedByRunId: runId,
    };
    fs.writeFileSync(path.join(BASELINE_DIR, safeName(key)), JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

/**
 * The stored passing DOM for this test case, or null when there is none —
 * which is the normal state for a test that has never passed since baseline
 * capture was added. Callers must treat null as "no reference available",
 * never as evidence about the fix.
 */
function loadBaseline(test) {
  const key = testCaseKey(test);
  if (!key) return null;
  try {
    const raw = fs.readFileSync(path.join(BASELINE_DIR, safeName(key)), 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.html !== 'string') return null;
    if (parsed.html.length < MIN_PLAUSIBLE_HTML_LENGTH) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Removes the baseline this test case recorded during `runId`, if that is
 * still the baseline on disk.
 *
 * Called when a verification rerun goes green but the green does not confirm
 * the fix (see unvalidatableRisks in ./risk.js and _resolvePendingVerification
 * in ../runManager.js). The pass already wrote a baseline by then — see the
 * note on recordBaseline for why it could not have known better at the time —
 * and keeping it would promote a page the app reached via an unvalidated fix
 * into the reference every future repair is matched against.
 *
 * The runId guard is what makes this safe to call unconditionally: if a later,
 * legitimate run has since replaced the baseline, that newer one is left
 * alone rather than a good baseline being deleted on the strength of an old
 * verdict. Best-effort — failing to discard must never disturb the run.
 */
function discardBaselineFromRun(test, runId) {
  const key = testCaseKey(test);
  if (!key || !runId) return false;
  const file = path.join(BASELINE_DIR, safeName(key));
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (parsed?.recordedByRunId !== runId) return false;
    fs.unlinkSync(file);
    return true;
  } catch {
    return false;
  }
}

module.exports = { recordBaseline, loadBaseline, discardBaselineFromRun, BASELINE_DIR };
