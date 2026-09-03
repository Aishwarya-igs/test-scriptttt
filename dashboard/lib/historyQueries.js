/**
 * Read-only facts about run history, computed from the SQLite index (db.js).
 *
 * This is the grounding layer for both AI history features (runSummary.js,
 * chat.js) — same reasoning as spotfix/locatorIndex.js and
 * spotfix/priorAttempts.js elsewhere in this codebase: an AI call is only as
 * trustworthy as the facts it's given, so every number an AI response cites
 * about run history should trace back to one of these functions, never to
 * the model inventing a plausible-sounding stat.
 *
 * Deliberately mirrors frontend/src/utils/runStats.ts's semantics exactly
 * (same FAILURE_STATUSES set, same file+title identity key, same "decided"
 * pass-rate definition) so a number quoted in a chat answer or an executive
 * summary never disagrees with the same number shown elsewhere on the
 * dashboard — two different-looking sources of truth for "the pass rate"
 * would itself be a credibility problem.
 */
const { getDb } = require('./db');

const FAILURE_STATUSES = ['failed', 'timedOut', 'interrupted'];
const FAILURE_IN = FAILURE_STATUSES.map(() => '?').join(',');

/** Most recent `limit` runs, newest first — the window most other queries here operate over by default. */
function recentRuns(limit = 20) {
  return getDb().prepare('SELECT * FROM runs ORDER BY created_at DESC LIMIT ?').all(limit);
}

/**
 * Overall pass rate across the last `limit` runs' totals — matches
 * OverviewPage.tsx's `decided = passed + failed; passRate = passed/decided`.
 */
function passRateSummary(limit = 20) {
  const runs = recentRuns(limit);
  const totals = runs.reduce(
    (acc, r) => {
      acc.passed += r.passed;
      acc.failed += r.failed;
      return acc;
    },
    { passed: 0, failed: 0 }
  );
  const decided = totals.passed + totals.failed;
  return {
    runsConsidered: runs.length,
    passRate: decided ? Math.round((totals.passed / decided) * 100) : null,
    totalPassed: totals.passed,
    totalFailed: totals.failed,
  };
}

/** Pass rate per run, oldest first — what OverviewPage's trend chart plots. */
function passRateTrend(limit = 20) {
  const runs = recentRuns(limit).reverse();
  return runs.map((r) => {
    const decided = r.passed + r.failed;
    return {
      runId: r.run_id,
      createdAt: r.created_at,
      passRate: decided ? Math.round((r.passed / decided) * 100) : null,
    };
  });
}

/**
 * Tests that have both passed and failed at least once in the last `window`
 * runs — identical definition to findFlakyTests in runStats.ts (file+title
 * identity, running excluded already at index-write time in db.js).
 */
function flakyTests({ window = 20, limit = 10 } = {}) {
  const runs = recentRuns(window);
  if (!runs.length) return [];
  const placeholders = runs.map(() => '?').join(',');
  const rows = getDb()
    .prepare(
      `SELECT file, title,
              SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) AS pass_count,
              SUM(CASE WHEN status IN (${FAILURE_IN}) THEN 1 ELSE 0 END) AS fail_count,
              COUNT(*) AS total_seen
       FROM tests
       WHERE run_id IN (${placeholders})
       GROUP BY file, title
       HAVING pass_count > 0 AND fail_count > 0
       ORDER BY fail_count DESC, total_seen DESC
       LIMIT ?`
    )
    .all(...FAILURE_STATUSES, ...runs.map((r) => r.run_id), limit);
  return rows.map((r) => ({ file: r.file, title: r.title, passCount: r.pass_count, failCount: r.fail_count, totalSeen: r.total_seen }));
}

/** Tests with the most failures in the last `window` runs, flaky or consistently broken. */
function topFailingTests({ window = 20, limit = 10 } = {}) {
  const runs = recentRuns(window);
  if (!runs.length) return [];
  const placeholders = runs.map(() => '?').join(',');
  const rows = getDb()
    .prepare(
      `SELECT file, title,
              SUM(CASE WHEN status IN (${FAILURE_IN}) THEN 1 ELSE 0 END) AS fail_count,
              COUNT(*) AS total_seen
       FROM tests
       WHERE run_id IN (${placeholders})
       GROUP BY file, title
       HAVING fail_count > 0
       ORDER BY fail_count DESC
       LIMIT ?`
    )
    .all(...FAILURE_STATUSES, ...runs.map((r) => r.run_id), limit);
  return rows.map((r) => ({ file: r.file, title: r.title, failCount: r.fail_count, totalSeen: r.total_seen }));
}

/** Slowest tests in the last `window` runs by duration, newest occurrence per title. */
function slowestTests({ window = 20, limit = 10 } = {}) {
  const runs = recentRuns(window);
  if (!runs.length) return [];
  const placeholders = runs.map(() => '?').join(',');
  const rows = getDb()
    .prepare(
      `SELECT title, file, MAX(duration) AS max_duration, AVG(duration) AS avg_duration
       FROM tests
       WHERE run_id IN (${placeholders}) AND duration IS NOT NULL
       GROUP BY file, title
       ORDER BY max_duration DESC
       LIMIT ?`
    )
    .all(...runs.map((r) => r.run_id), limit);
  return rows.map((r) => ({ title: r.title, file: r.file, maxDurationMs: r.max_duration, avgDurationMs: Math.round(r.avg_duration) }));
}

/** One run's own summary plus its failing test titles — the unit a proactive run summary is built from. */
function runDetail(runId) {
  const run = getDb().prepare('SELECT * FROM runs WHERE run_id = ?').get(runId);
  if (!run) return null;
  const failing = getDb()
    .prepare(`SELECT title, file, status, rca_category, spot_fix_available, spot_fix_applied FROM tests WHERE run_id = ? AND status IN (${FAILURE_IN})`)
    .all(runId, ...FAILURE_STATUSES);
  return {
    runId: run.run_id,
    createdAt: run.created_at,
    status: run.status,
    env: run.env,
    project: run.project,
    total: run.total,
    passed: run.passed,
    failed: run.failed,
    skipped: run.skipped,
    failingTests: failing.map((f) => ({
      title: f.title,
      file: f.file,
      status: f.status,
      rcaCategory: f.rca_category,
      spotFixAvailable: !!f.spot_fix_available,
      spotFixApplied: !!f.spot_fix_applied,
    })),
  };
}

/** Per-test pass/fail delta between two runs — grounds "what changed between the last two runs" style questions. */
function compareRuns(runIdA, runIdB) {
  const rows = getDb()
    .prepare(
      `SELECT run_id, file, title, status FROM tests WHERE run_id IN (?, ?)`
    )
    .all(runIdA, runIdB);
  const byKey = new Map();
  for (const r of rows) {
    const key = `${r.file}::${r.title}`;
    if (!byKey.has(key)) byKey.set(key, { file: r.file, title: r.title });
    byKey.get(key)[r.run_id === runIdA ? 'a' : 'b'] = r.status;
  }
  const changed = [];
  for (const entry of byKey.values()) {
    if (entry.a && entry.b && entry.a !== entry.b) changed.push(entry);
  }
  return { runA: runDetail(runIdA), runB: runDetail(runIdB), changed };
}

module.exports = { recentRuns, passRateSummary, passRateTrend, flakyTests, topFailingTests, slowestTests, runDetail, compareRuns };
