/**
 * Admin accounts — a plain array in admin-dashboard/data/accounts.json.
 * Multi-admin, by explicit choice: the login page always offers "Sign up",
 * not just on a first-run empty state. That trades away the earlier
 * single-admin guarantee (nobody but a filesystem-level operator could ever
 * create a login) for letting more than one person have their own account —
 * accepted deliberately, not a default.
 *
 * Migrates the earlier single-account file (admin.json, one object, from
 * before multi-admin existed) into this array shape the first time it's
 * read, so an already-created account isn't silently lost.
 */
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('./auth');
const { DATA_DIR } = require('./paths');

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const LEGACY_ACCOUNT_FILE = path.join(DATA_DIR, 'admin.json');

function writeAccounts(accounts) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
}

function readAccounts() {
  try {
    const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall through to the one-time legacy migration below.
  }
  try {
    const legacy = JSON.parse(fs.readFileSync(LEGACY_ACCOUNT_FILE, 'utf-8'));
    if (legacy && typeof legacy.username === 'string' && typeof legacy.passwordHash === 'string') {
      const migrated = [{ username: legacy.username, passwordHash: legacy.passwordHash, createdAt: legacy.updatedAt || new Date().toISOString() }];
      writeAccounts(migrated);
      return migrated;
    }
  } catch {
    // No legacy file either — genuinely no accounts yet.
  }
  return [];
}

function hasAnyAccount() {
  return readAccounts().length > 0;
}

function findAccount(username) {
  if (typeof username !== 'string') return null;
  return readAccounts().find((a) => a.username === username) || null;
}

function validateCredentials(username, password) {
  if (typeof username !== 'string' || !username.trim()) throw new Error('Username is required');
  if (typeof password !== 'string' || password.length < 8) throw new Error('Password must be at least 8 characters');
}

/** Callable any time — the only restriction is that the username must be free. */
function createAccount({ username, password }) {
  validateCredentials(username, password);
  const trimmed = username.trim();
  const accounts = readAccounts();
  if (accounts.some((a) => a.username === trimmed)) {
    const err = new Error('That username is already taken');
    err.code = 'USERNAME_TAKEN';
    throw err;
  }
  const account = { username: trimmed, passwordHash: hashPassword(password), createdAt: new Date().toISOString() };
  writeAccounts([...accounts, account]);
  return account;
}

/** CLI recovery path: create-or-reset one account's password directly on disk. */
function writeAccount({ username, password }) {
  validateCredentials(username, password);
  const trimmed = username.trim();
  const accounts = readAccounts();
  const idx = accounts.findIndex((a) => a.username === trimmed);
  const account = {
    username: trimmed,
    passwordHash: hashPassword(password),
    createdAt: idx === -1 ? new Date().toISOString() : accounts[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  if (idx === -1) accounts.push(account);
  else accounts[idx] = account;
  writeAccounts(accounts);
  return account;
}

/** Public-facing list for the "manage accounts" panel — usernames and dates only, never a hash. */
function listAccountSummaries() {
  return readAccounts()
    .map((a) => ({ username: a.username, createdAt: a.createdAt }))
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

/**
 * Removes one account. Refuses to remove the last remaining account — this
 * is the one guard against a genuinely destructive outcome (nobody could
 * sign in again without filesystem access to run the CLI recovery script).
 * The caller (routes/accounts.js) additionally refuses to let a session
 * delete its own account, so a signed-in admin can't lock themselves out
 * of the tab they're using either.
 */
function deleteAccount(username) {
  const accounts = readAccounts();
  if (accounts.length <= 1) throw new Error('Cannot remove the last remaining admin account');
  const next = accounts.filter((a) => a.username !== username);
  if (next.length === accounts.length) throw new Error('Unknown account');
  writeAccounts(next);
}

module.exports = { hasAnyAccount, findAccount, createAccount, writeAccount, listAccountSummaries, deleteAccount, ACCOUNTS_FILE };
