/**
 * One shared login per client — generated automatically when the client is
 * onboarded, so the admin never has to invent a username/password. This is
 * a *different* principal from an admin account (lib/adminAccount.js): it
 * can only ever reach that one client's own read-only view, never the
 * client registry, other clients, or account management.
 *
 * The password is kept in clients.json in the clear (alongside its hash),
 * not just hashed — unlike an admin's own password, this one belongs to
 * the admin to view and re-share on demand (that's the whole point of the
 * "Share access" panel), not a secret the admin themselves shouldn't be
 * able to see again.
 */
const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('./auth');

// Excludes visually-ambiguous characters (0/O, 1/l/I) since this gets typed
// or read aloud by someone on the client's team, not pasted by a password manager.
const PASSWORD_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const PASSWORD_LENGTH = 12;

function generatePassword() {
  let out = '';
  const bytes = crypto.randomBytes(PASSWORD_LENGTH);
  for (let i = 0; i < PASSWORD_LENGTH; i++) out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  return out;
}

/** A client's own id is already a unique, boring, URL-safe slug — reused directly as its login username rather than generating a second identifier to track. */
function usernameForClient(clientId) {
  return clientId;
}

function createCredential(clientId) {
  const password = generatePassword();
  return {
    username: usernameForClient(clientId),
    password,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
}

function verifyCredential(credential, password) {
  if (!credential || typeof password !== 'string') return false;
  return verifyPassword(password, credential.passwordHash);
}

module.exports = { createCredential, verifyCredential, usernameForClient };
