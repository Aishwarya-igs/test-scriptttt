/**
 * Read-only aggregation of a client's OWN Automation Dashboard history.
 *
 * Never writes anything, never requires/imports anything from dashboard/ —
 * it only reads two possible on-disk shapes a client's repo might already
 * have, both produced entirely by that client's own separately-running
 * Automation Dashboard instance:
 *   1. <repoPath>/dashboard/data/dashboard.db  (preferred — already
 *      aggregated by dashboard/lib/db.js's `runs` table; opened with
 *      node:sqlite's `readOnly: true`, verified to reject writes)
 *   2. <repoPath>/dashboard/data/runs/*.json   (fallback — the same run
 *      records db.js is itself derived from, scanned directly)
 *
 * Neither existing is not an error — it just means the client hasn't run
 * tests yet, or their repo isn't laid out the same way. Callers get an
 * `{available: false}` shape to render as "no data yet", never a thrown
 * error: one badly-onboarded client must never break the rest of the
 * overview page.
 */
const fs = require('fs');
const path = require('path');

let DatabaseSync = null;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  // Older Node than this app expects — falls back to the JSON-scan path below.
}

function emptyStats() {
  return { available: false, totalRuns: 0, passed: 0, failed: 0, skipped: 0, passRate: null, lastRunAt: null, lastRunStatus: null };
}

function summarize(totalRuns, passed, failed, skipped, last) {
  if (totalRuns === 0) return emptyStats();
  const totalTests = passed + failed + skipped;
  return {
    available: true,
    totalRuns,
    passed,
    failed,
    skipped,
    passRate: totalTests > 0 ? Math.round((passed / totalTests) * 100) : null,
    lastRunAt: last?.createdAt || null,
    lastRunStatus: last?.status || null,
  };
}

function statsFromDb(dbFile) {
  const db = new DatabaseSync(dbFile, { readOnly: true });
  try {
    const totals = db
      .prepare('SELECT COUNT(*) AS totalRuns, SUM(passed) AS passed, SUM(failed) AS failed, SUM(skipped) AS skipped FROM runs')
      .get();
    const last = db.prepare('SELECT created_at AS createdAt, status FROM runs ORDER BY created_at DESC LIMIT 1').get();
    return summarize(Number(totals?.totalRuns || 0), Number(totals?.passed || 0), Number(totals?.failed || 0), Number(totals?.skipped || 0), last);
  } finally {
    db.close();
  }
}

function statsFromRunFiles(runsDir) {
  let files;
  try {
    files = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json'));
  } catch {
    return emptyStats();
  }

  let totalRuns = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let last = null;

  for (const file of files) {
    let run;
    try {
      run = JSON.parse(fs.readFileSync(path.join(runsDir, file), 'utf-8'));
    } catch {
      continue; // One corrupt run file must not sink the whole summary.
    }
    totalRuns += 1;
    passed += Number(run.stats?.passed || 0);
    failed += Number(run.stats?.failed || 0);
    skipped += Number(run.stats?.skipped || 0);
    if (!last || (run.createdAt || '') > (last.createdAt || '')) {
      last = { createdAt: run.createdAt || null, status: run.status || null };
    }
  }

  return summarize(totalRuns, passed, failed, skipped, last);
}

/** Best-effort, never throws — a badly-onboarded client shows "no data yet", not a 500. */
function getClientStats(client) {
  if (!client?.repoPath) return emptyStats();
  const dashboardDataDir = path.join(client.repoPath, 'dashboard', 'data');
  const dbFile = path.join(dashboardDataDir, 'dashboard.db');

  if (DatabaseSync && fs.existsSync(dbFile)) {
    try {
      return statsFromDb(dbFile);
    } catch {
      // Fall through to the JSON scan — a mid-write WAL file is exactly the
      // kind of thing a read-only open can legitimately trip on.
    }
  }
  return statsFromRunFiles(path.join(dashboardDataDir, 'runs'));
}

const RECENT_RUNS_LIMIT = 8;
const FLAKY_TESTS_LIMIT = 8;

function detailFromDb(dbFile) {
  const db = new DatabaseSync(dbFile, { readOnly: true });
  try {
    const recentRuns = db
      .prepare('SELECT run_id AS runId, created_at AS createdAt, status, total, passed, failed, skipped FROM runs ORDER BY created_at DESC LIMIT ?')
      .all(RECENT_RUNS_LIMIT);
    // A test is flaky here in the plain sense: across every run this client
    // has recorded, it has landed on both sides at least once. Grouped
    // across all runs (not just the recent window above) since a test that
    // flipped three runs ago is exactly as worth flagging as one that
    // flipped yesterday — recency is what the "recent runs" list is for.
    const flakyTests = db
      .prepare(
        `SELECT file, title,
                COUNT(DISTINCT CASE WHEN status = 'passed' THEN run_id END) AS passRuns,
                COUNT(DISTINCT CASE WHEN status = 'failed' THEN run_id END) AS failRuns
         FROM tests
         GROUP BY file, title
         HAVING passRuns > 0 AND failRuns > 0
         ORDER BY failRuns DESC
         LIMIT ?`
      )
      .all(FLAKY_TESTS_LIMIT);
    return {
      recentRuns: recentRuns.map((r) => ({ ...r, total: Number(r.total), passed: Number(r.passed), failed: Number(r.failed), skipped: Number(r.skipped) })),
      flakyTests: flakyTests.map((t) => ({ file: t.file, title: t.title, passRuns: Number(t.passRuns), failRuns: Number(t.failRuns) })),
    };
  } finally {
    db.close();
  }
}

function detailFromRunFiles(runsDir) {
  let files;
  try {
    files = fs.readdirSync(runsDir).filter((f) => f.endsWith('.json'));
  } catch {
    return { recentRuns: [], flakyTests: [] };
  }

  const runs = [];
  // key: `${file}::${title}` — mirrors the (file, title) grouping the DB
  // query above uses, since raw run JSON has no cross-run test id to join on.
  const testOutcomes = new Map();

  for (const file of files) {
    let run;
    try {
      run = JSON.parse(fs.readFileSync(path.join(runsDir, file), 'utf-8'));
    } catch {
      continue;
    }
    runs.push({
      runId: run.runId || file.replace(/\.json$/, ''),
      createdAt: run.createdAt || null,
      status: run.status || null,
      total: Number(run.stats?.total || 0),
      passed: Number(run.stats?.passed || 0),
      failed: Number(run.stats?.failed || 0),
      skipped: Number(run.stats?.skipped || 0),
    });
    for (const test of Object.values(run.tests || {})) {
      const key = `${test.file || ''}::${test.title || ''}`;
      const entry = testOutcomes.get(key) || { file: test.file || '', title: test.title || '', passRuns: 0, failRuns: 0 };
      if (test.status === 'passed') entry.passRuns += 1;
      else if (test.status === 'failed') entry.failRuns += 1;
      testOutcomes.set(key, entry);
    }
  }

  runs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const flakyTests = [...testOutcomes.values()]
    .filter((t) => t.passRuns > 0 && t.failRuns > 0)
    .sort((a, b) => b.failRuns - a.failRuns)
    .slice(0, FLAKY_TESTS_LIMIT);

  return { recentRuns: runs.slice(0, RECENT_RUNS_LIMIT), flakyTests };
}

/** Same read-only-or-nothing posture as getClientStats, one level deeper: recent runs + cross-run flaky tests for one client's own drill-down page. */
function getClientDetail(client) {
  const stats = getClientStats(client);
  if (!client?.repoPath) return { stats, recentRuns: [], flakyTests: [] };
  const dashboardDataDir = path.join(client.repoPath, 'dashboard', 'data');
  const dbFile = path.join(dashboardDataDir, 'dashboard.db');

  if (DatabaseSync && fs.existsSync(dbFile)) {
    try {
      return { stats, ...detailFromDb(dbFile) };
    } catch {
      // Same fallback reasoning as getClientStats.
    }
  }
  return { stats, ...detailFromRunFiles(path.join(dashboardDataDir, 'runs')) };
}

/**
 * Rolls every onboarded client's own stats up into one consolidated
 * summary — what the admin sees first, before drilling into any one
 * client's card. Weighted by actual test counts (not an average of
 * per-client percentages), so one client with 2 runs doesn't count the same
 * as one with 200.
 */
function getOverviewStats(clients) {
  let totalRuns = 0;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let clientsWithData = 0;
  let lastActivityAt = null;

  for (const client of clients) {
    const stats = getClientStats(client);
    if (!stats.available) continue;
    clientsWithData += 1;
    totalRuns += stats.totalRuns;
    passed += stats.passed;
    failed += stats.failed;
    skipped += stats.skipped;
    if (!lastActivityAt || (stats.lastRunAt || '') > lastActivityAt) lastActivityAt = stats.lastRunAt;
  }

  const totalTests = passed + failed + skipped;
  return {
    totalClients: clients.length,
    clientsWithData,
    totalRuns,
    overallPassRate: totalTests > 0 ? Math.round((passed / totalTests) * 100) : null,
    lastActivityAt,
  };
}

module.exports = { getClientStats, getClientDetail, getOverviewStats };
