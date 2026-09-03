/**
 * Single-admin auth: scrypt password hashing + a stateless, HMAC-signed
 * session cookie. No server-side session store (no express-session), and no
 * jsonwebtoken/bcrypt dependency — both would be one more thing to install
 * for what one admin account needs, and this app's own dev server restarts
 * on every edit just like dashboard/server.js does, so a server-side session
 * would silently log the admin out on every restart. A cookie that verifies
 * itself has nothing to lose.
 */
const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
// "Remember for 30 days" (checked) vs. a short-lived default (unchecked) —
// both the cookie's own Max-Age *and* the signed exp inside the payload
// change, so an unchecked session dies on its own even if something restores
// the browser's tabs after it "closed".
const REMEMBERED_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;
const SCRYPT_KEYLEN = 64;

/** Format: scrypt:<saltHex>:<hashHex> — self-describing so the algorithm can change later without breaking old hashes. */
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

/** Timing-safe compare — never throws, even for a malformed stored hash (e.g. ADMIN_PASSWORD_HASH not set yet). */
function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, hashHex] = parts;
  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadB64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

/**
 * Builds the `Set-Cookie` value for a fresh session. `remember: true` is the
 * "Remember for 30 days" checkbox; otherwise the session both expires
 * quickly on its own (`exp` inside the signed payload) and is a browser
 * session cookie (no `Max-Age` at all), so it's gone on next browser close.
 * `username` rides along in the signed payload — now that there can be more
 * than one admin account, the session has to say *which* one it belongs to.
 */
function createSessionCookie(secret, { remember = false, username } = {}) {
  const ttl = remember ? REMEMBERED_TTL_MS : DEFAULT_TTL_MS;
  const payload = JSON.stringify({ username, exp: Date.now() + ttl });
  const payloadB64 = base64url(payload);
  const signature = sign(payloadB64, secret);
  const maxAge = remember ? `; Max-Age=${Math.floor(ttl / 1000)}` : '';
  return `${COOKIE_NAME}=${payloadB64}.${signature}; HttpOnly; SameSite=Lax; Path=/${maxAge}`;
}

/** Clears the session cookie on logout. */
function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseCookies(cookieHeader) {
  const out = {};
  for (const part of (cookieHeader || '').split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

/** Returns the session's `{ username, exp }` payload if the cookie is validly-signed and unexpired, else null. */
function verifySessionCookie(cookieHeader, secret) {
  const raw = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!raw) return null;
  const dotIndex = raw.lastIndexOf('.');
  if (dotIndex === -1) return null;
  const payloadB64 = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);
  const expectedSignature = sign(payloadB64, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    return typeof payload.exp === 'number' && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// A crude, process-local lockout: not a defense against a network attacker
// (the server only ever binds 127.0.0.1), just a speed bump against a script
// hammering the login form from the same machine. Resets on server restart,
// which is fine for a single-admin, localhost-only tool.
const FAILED_LOGIN_LIMIT = 10;
const FAILED_LOGIN_WINDOW_MS = 5 * 60 * 1000;
let failedAttempts = [];

function registerFailedLogin() {
  const now = Date.now();
  failedAttempts = failedAttempts.filter((t) => now - t < FAILED_LOGIN_WINDOW_MS);
  failedAttempts.push(now);
}

function isLockedOut() {
  const now = Date.now();
  failedAttempts = failedAttempts.filter((t) => now - t < FAILED_LOGIN_WINDOW_MS);
  return failedAttempts.length >= FAILED_LOGIN_LIMIT;
}

function clearFailedLogins() {
  failedAttempts = [];
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  verifySessionCookie,
  registerFailedLogin,
  isLockedOut,
  clearFailedLogins,
};
