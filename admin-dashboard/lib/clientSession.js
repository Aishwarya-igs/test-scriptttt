/**
 * Session handling for a client-scoped login — completely separate from an
 * admin's own session (lib/auth.js): different cookie name (`client_session`
 * vs `admin_session`), so the two can never be confused with each other or
 * clobber one another in the same browser. Same stateless-HMAC-cookie
 * approach as admin sessions, reimplemented here in full (rather than
 * reaching into lib/auth.js's internals) so nothing about the existing
 * admin auth path is touched by adding this.
 */
const crypto = require('crypto');

const COOKIE_NAME = 'client_session';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day — a client-team session is meant to be re-opened via the shared link, not kept alive for weeks.

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadB64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
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

/** Builds the `Set-Cookie` value for a fresh client session, scoped to one clientId. */
function createClientSessionCookie(secret, { clientId }) {
  const payload = JSON.stringify({ clientId, exp: Date.now() + TTL_MS });
  const payloadB64 = base64url(payload);
  const signature = sign(payloadB64, secret);
  return `${COOKIE_NAME}=${payloadB64}.${signature}; HttpOnly; SameSite=Lax; Path=/`;
}

function clearClientSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

/** Returns `{ clientId, exp }` if the cookie is validly-signed and unexpired, else null. */
function verifyClientSessionCookie(cookieHeader, secret) {
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

module.exports = { createClientSessionCookie, clearClientSessionCookie, verifyClientSessionCookie };
