const { loadErrorContext } = require('./errorContext');
const { loadDomSnapshot } = require('./domSnapshot');
const { loadHangingAction } = require('./traceActions');
const { runHeuristics, applyTimeoutCategoryGuard } = require('./heuristics');
const { runOllama } = require('./providers/ollama');
const { runApiProviderChain } = require('./providers/apiChain');
const { getConfig } = require('./config');
// Reused from spot-fix: the same candidate-file resolution (stack trace +
// error-literal search) that grounds a spot-fix proposal, given to RCA too
// so its code-vs-environment call isn't made on strictly less evidence than
// the very next click gets. Kept to a small limit (2 files) — RCA only needs
// enough to judge the category, not to author an edit.
const { collectCandidateFiles, addErrorLiteralMatches } = require('../spotfix/sourceFiles');
const { stripAnsi } = require('./ansi');
// Cross-run memory: has this exact test case (matched by its stable ticket-id
// identity, not file+line — see testCaseIdentity.js) failed before, and what
// did RCA/spot-fix conclude those times? Without this, every occurrence is
// analyzed as if it's the first time, even when the same root cause has
// already been diagnosed (or a fix already tried and disproven) in a past run.
const { testCaseKey } = require('../testCaseIdentity');
const { getTestCaseHistory } = require('../testCaseHistory');

/**
 * See ./config.js for what RCA_PROVIDER selects. All AI paths fall back to
 * heuristics on any failure (missing key, unreachable, bad response) so
 * analysis never hard-fails for the user.
 *
 * `excludeRunId` (the run this test belongs to, when known) keeps the prior-
 * history lookup from citing this very same occurrence as if it were history.
 */
async function analyzeTest(test, { excludeRunId } = {}) {
  const errorContext = loadErrorContext(test);
  const config = getConfig();
  const generatedAt = () => new Date().toISOString();
  const errorContextFile = errorContext?.file || null;

  const contextFiles = collectCandidateFiles(test, { limit: 2 });
  // Widens straight to wherever the error's own strings are declared — under
  // the Page Object pattern this repo uses, that's usually the locator's
  // actual declaration site, far from the stack frame that merely used it.
  addErrorLiteralMatches(contextFiles, stripAnsi(test.error?.message));
  const priorHistory = getTestCaseHistory(testCaseKey(test), { excludeRunId, limit: 5 });
  // What the test was still waiting on when it was killed, recovered from
  // the trace — the only evidence a bare timeout has, and previously unread.
  // Only attempted for a timeout, since that's the sole case where nothing
  // else in the error identifies where it got stuck (see traceActions.js).
  const hangingAction = test.status === 'timedOut' ? loadHangingAction(test) : null;
  // This project's own afterEach hook (src/fixtures/test-hooks.ts) captures
  // page.content() fresh, from the actual failing test's page, after the
  // failure/timeout already happened — unlike Playwright's built-in
  // error-context.md, which was observed to carry over a stale snapshot from
  // an earlier test in the same worker on a whole-test timeout (see
  // TIMED_OUT_UNSAFE_RULE_IDS in heuristics.js). That makes this the one
  // trustworthy source heuristics can use to actually check whether a hung
  // selector exists on the page, instead of only speculating either way.
  const domSnapshot = loadDomSnapshot(test);
  const context = { files: contextFiles, domSnapshot, priorHistory, hangingAction };

  let result;
  if (config.provider === 'ollama') {
    try {
      result = await runOllama(test, errorContext, { url: config.ollamaUrl, model: config.ollamaModel }, context);
    } catch (err) {
      result = {
        ...runHeuristics(test, errorContext, hangingAction, domSnapshot),
        note: `Ollama unavailable (${err.message}); showing heuristic analysis instead.`,
      };
    }
  } else if (config.provider === 'api') {
    try {
      // Tries every configured provider in order (see config.parseApiChain)
      // before giving up — one exhausted quota or dead key no longer takes
      // analysis all the way down to heuristics as long as another
      // configured provider still works.
      result = await runApiProviderChain(test, errorContext, config.apiChain, context);
    } catch (err) {
      result = {
        ...runHeuristics(test, errorContext, hangingAction, domSnapshot),
        note: `AI provider unavailable (${err.message}); showing heuristic analysis instead.`,
      };
    }
  } else {
    result = runHeuristics(test, errorContext, hangingAction, domSnapshot);
  }

  // Deterministic correction pass: a bare "Test timeout of Nms exceeded" is
  // ambiguous on its own, and left entirely to a provider's free-form read
  // of the page snapshot, identical-looking timeouts can land in different
  // categories from one call to the next. This runs regardless of which
  // path produced `result` above. See heuristics.js for the reasoning.
  result = applyTimeoutCategoryGuard(test, result, hangingAction);

  return { ...result, generatedAt: generatedAt(), errorContextFile };
}

module.exports = { analyzeTest, getConfig };
