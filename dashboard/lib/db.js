/**
 * SQLite index over run history — NOT the source of truth.
 *
 * dashboard/data/runs/<runId>.json remains authoritative for everything about
 * a run (every field runManager.js reads/writes lives there, unchanged). This
 * database exists purely as a queryable summary layer for the two features
 * that need to reason across MANY runs at once (the proactive run summary and
 * the conversational history chat) — scanning and JSON-parsing every run file
 * on disk for that, as findPriorFailedAttempts in spotfix/priorAttempts.js
 * already does for one narrow case, does not scale as history grows into the
 * hundreds or thousands of runs.
 *
 * Uses node:sqlite (built into Node 22.5+, stable here on Node 24) rather
 * than a native dependency like better-sqlite3 — zero install footprint, no
 * native-compile risk on a Windows dev machine.
 *
 * Every row here is DERIVED and disposable: dropping dashboard.db and
 * calling backfillFromDisk() again reconstructs it byte-for-byte from the
 * run JSON files. Nothing here is ever the only copy of a fact.
 */
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./paths');

const DB_FILE = path.join(DATA_DIR, 'dashboard.db');

let db;

function getDb() {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA journal_mode = WAL'); // readers (chat queries) don't block writers (test events)
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      run_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      trigger_type TEXT,
      env TEXT,
      project TEXT,
      status TEXT,
      total INTEGER NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0,
      failed INTEGER NOT NULL DEFAULT 0,
      skipped INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at);

    CREATE TABLE IF NOT EXISTS tests (
      run_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      title TEXT,
      file TEXT,
      line INTEGER,
      project TEXT,
      status TEXT,
      duration INTEGER,
      rca_category TEXT,
      spot_fix_available INTEGER NOT NULL DEFAULT 0,
      spot_fix_applied INTEGER NOT NULL DEFAULT 0,
      spot_fix_verification_status TEXT,
      PRIMARY KEY (run_id, test_id)
    );
    CREATE INDEX IF NOT EXISTS idx_tests_run_id ON tests(run_id);
    CREATE INDEX IF NOT EXISTS idx_tests_file_title ON tests(file, title);
  `);
  return db;
}

/**
 * Replaces everything indexed for one run with what `run` currently says.
 *
 * Delete-then-reinsert rather than a diffed update: a run's test count here
 * is small (tens, not thousands), so the simplicity of "the index always
 * exactly matches this run object" is worth more than the marginal cost of
 * rewriting every row on every save. Called from the same place runManager
 * already persists the run JSON (_saveRun), so the two never drift.
 *
 * Never throws — this index is supporting infrastructure for two optional
 * features, not something a write failure here should ever be able to take
 * a test run down over.
 */
function syncRun(run) {
  try {
    const conn = getDb();
    conn
      .prepare(
        `INSERT INTO runs (run_id, created_at, trigger_type, env, project, status, total, passed, failed, skipped)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(run_id) DO UPDATE SET
           status = excluded.status, total = excluded.total, passed = excluded.passed,
           failed = excluded.failed, skipped = excluded.skipped`
      )
      .run(
        run.runId,
        run.createdAt,
        run.trigger?.type || null,
        run.trigger?.env || null,
        run.trigger?.project || null,
        run.status,
        run.stats?.total || 0,
        run.stats?.passed || 0,
        run.stats?.failed || 0,
        run.stats?.skipped || 0
      );

    conn.prepare('DELETE FROM tests WHERE run_id = ?').run(run.runId);
    const insertTest = conn.prepare(
      `INSERT INTO tests (run_id, test_id, title, file, line, project, status, duration, rca_category, spot_fix_available, spot_fix_applied, spot_fix_verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const t of Object.values(run.tests || {})) {
      if (t.status === 'running') continue; // an in-progress test isn't a historical fact yet
      insertTest.run(
        run.runId,
        t.testId,
        t.title || null,
        t.file || null,
        t.line || null,
        t.project || null,
        t.status || null,
        typeof t.duration === 'number' ? t.duration : null,
        t.rca?.category || null,
        t.spotFix?.available ? 1 : 0,
        t.spotFix?.applied ? 1 : 0,
        t.spotFix?.verification?.status || null
      );
    }
  } catch (err) {
    console.error('[dashboard] db sync failed (non-fatal):', err.message);
  }
}

function deleteRunFromIndex(runId) {
  try {
    const conn = getDb();
    conn.prepare('DELETE FROM tests WHERE run_id = ?').run(runId);
    conn.prepare('DELETE FROM runs WHERE run_id = ?').run(runId);
  } catch (err) {
    console.error('[dashboard] db delete failed (non-fatal):', err.message);
  }
}

/**
 * Rebuilds the index from every run JSON file on disk. Safe to call anytime
 * (e.g. at server startup) — syncRun's delete-then-reinsert makes this
 * idempotent, and it's how the index recovers from being deleted, corrupted,
 * or simply not existing yet on an upgrade from before this file existed.
 */
function backfillFromDisk() {
  const { RUNS_DIR } = require('./paths');
  let files;
  try {
    files = fs.readdirSync(RUNS_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return 0;
  }
  let count = 0;
  for (const file of files) {
    try {
      const run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, file), 'utf-8'));
      syncRun(run);
      count += 1;
    } catch (err) {
      console.error(`[dashboard] skipping unreadable run file ${file} during db backfill:`, err.message);
    }
  }
  return count;
}

module.exports = { getDb, syncRun, deleteRunFromIndex, backfillFromDisk, DB_FILE };
