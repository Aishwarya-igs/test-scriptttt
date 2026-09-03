/**
 * Cross-run history for one test CASE (see testCaseIdentity.js) — every
 * time it showed up in a past run, what RCA said, and what happened with
 * any spot fix. This is the shared scan both priorAttempts.js (a narrow,
 * guardrail-facing filter over it) and the test-history API/UI (the full
 * picture, for a human) build on, so there's exactly one place that reads
 * every run file on disk looking for a given test case.
 */
const fs = require('fs');
const path = require('path');
const { RUNS_DIR } = require('./paths');
const { testCaseKey } = require('./testCaseIdentity');

/**
 * Every stored occurrence of a test sharing `key` across all runs on disk,
 * most recent first. Best-effort: a missing/corrupt run file is skipped
 * rather than failing the whole lookup — this is supporting context, not
 * something that should be able to break RCA/spot-fix generation or the API
 * route that serves it.
 */
function findTestOccurrences(key, { excludeRunId, limit = Infinity } = {}) {
  let runFiles;
  try {
    runFiles = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }

  const out = [];
  for (const fileName of runFiles) {
    const runId = fileName.replace(/\.json$/, '');
    if (runId === excludeRunId) continue;

    let run;
    try {
      run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, fileName), 'utf-8'));
    } catch {
      continue;
    }

    for (const test of Object.values(run.tests || {})) {
      if (testCaseKey(test) !== key) continue;
      out.push({ runId, createdAt: run.createdAt, test });
    }
  }

  out.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return Number.isFinite(limit) ? out.slice(0, limit) : out;
}

/**
 * Condensed, UI/prompt-friendly history: what happened each time this test
 * case showed up in a past run — status, RCA category/summary if analyzed,
 * and the spot-fix outcome if one was proposed (confidence, applied,
 * verification result, reverted).
 */
function getTestCaseHistory(key, opts = {}) {
  return findTestOccurrences(key, opts).map(({ runId, createdAt, test }) => ({
    runId,
    createdAt,
    testId: test.testId,
    status: test.status,
    rca: test.rca
      ? { category: test.rca.category, summary: test.rca.summary, generatedAt: test.rca.generatedAt }
      : null,
    spotFix: test.spotFix?.available
      ? {
          confidence: test.spotFix.confidence,
          explanation: test.spotFix.explanation || '',
          applied: Boolean(test.spotFix.applied),
          verification: test.spotFix.verification?.status || null,
          reverted: Boolean(test.spotFix.reverted),
          generatedAt: test.spotFix.generatedAt,
        }
      : null,
  }));
}

module.exports = { findTestOccurrences, getTestCaseHistory };
