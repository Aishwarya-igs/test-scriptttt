/**
 * Durable list of spot fixes currently applied to the working tree.
 *
 * Without this, an applied fix is only reachable from the run record it was
 * generated on — and the main flow ("Apply & rerun") navigates straight to a
 * *new* run, whose test record has no proposal attached. The undo button would
 * effectively disappear at exactly the moment it's needed: the rerun failed
 * and the change should come back out.
 *
 * These are real edits to a shared repo, so the more important job is making
 * them impossible to forget. This registry is what lets the UI say "N spot
 * fixes are currently applied" from anywhere, and revert any of them without
 * knowing which run produced it.
 *
 * Entries are removed on revert, so the file describes only what is still
 * applied. It is not a history log.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { DATA_DIR } = require('../paths');

const REGISTRY_FILE = path.join(DATA_DIR, 'spotfix-applied.json');

/** Never throws: a missing or corrupt registry must not break a run. */
function readAll() {
  try {
    const parsed = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Records an applied fix and returns its id. The full apply record is stored
 * (backup paths, hashes, line endings) so a revert works even if the
 * originating run's JSON has since been pruned.
 */
function record({ runId, testId, testTitle, applyRecord }) {
  const entry = {
    id: crypto.randomUUID(),
    runId,
    testId,
    testTitle: testTitle || '',
    appliedAt: applyRecord.appliedAt,
    files: applyRecord.files,
  };
  writeAll([...readAll(), entry]);
  return entry;
}

function list() {
  return readAll();
}

function get(id) {
  return readAll().find((e) => e.id === id) || null;
}

function remove(id) {
  const remaining = readAll().filter((e) => e.id !== id);
  writeAll(remaining);
  return remaining;
}

/** Drops the entry for a run/test pair, whichever id it has. */
function removeByTest(runId, testId) {
  const remaining = readAll().filter((e) => !(e.runId === runId && e.testId === testId));
  writeAll(remaining);
  return remaining;
}

/**
 * The shape sent to the browser: enough to explain and revert a fix, without
 * absolute paths, content hashes, or backup locations.
 */
function toPublic(entry) {
  return {
    id: entry.id,
    runId: entry.runId,
    testId: entry.testId,
    testTitle: entry.testTitle,
    appliedAt: entry.appliedAt,
    files: (entry.files || []).map((f) => f.file),
  };
}

module.exports = { record, list, get, remove, removeByTest, toPublic, REGISTRY_FILE };
