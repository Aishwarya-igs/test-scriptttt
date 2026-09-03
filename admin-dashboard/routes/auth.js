const express = require('express');
const { verifyPassword, createSessionCookie, clearSessionCookie, verifySessionCookie, registerFailedLogin, isLockedOut, clearFailedLogins } = require('../lib/auth');
const { findAccount, createAccount } = require('../lib/adminAccount');

const router = express.Router();

/** Register a new admin account — callable any time, not just on a first-run empty state. Only a taken username is rejected. */
router.post('/setup', (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server is missing SESSION_SECRET — check admin-dashboard/.env' });
  }
  const { username, password, remember } = req.body || {};
  let account;
  try {
    account = createAccount({ username, password });
  } catch (err) {
    return res.status(err.code === 'USERNAME_TAKEN' ? 409 : 400).json({ error: err.message });
  }
  res.setHeader('Set-Cookie', createSessionCookie(secret, { remember: Boolean(remember), username: account.username }));
  res.status(201).json({ authenticated: true, username: account.username });
});

router.post('/login', (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server is missing SESSION_SECRET — check admin-dashboard/.env' });
  }
  if (isLockedOut()) {
    return res.status(429).json({ error: 'Too many failed attempts — try again in a few minutes' });
  }

  const { username, password, remember } = req.body || {};
  const account = findAccount(username);
  const validPassword = Boolean(account) && typeof password === 'string' && verifyPassword(password, account.passwordHash);

  if (!account || !validPassword) {
    registerFailedLogin();
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  clearFailedLogins();
  res.setHeader('Set-Cookie', createSessionCookie(secret, { remember: Boolean(remember), username: account.username }));
  res.json({ authenticated: true, username: account.username });
});

router.post('/logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie());
  res.json({ authenticated: false });
});

router.get('/me', (req, res) => {
  const secret = process.env.SESSION_SECRET;
  const session = secret && verifySessionCookie(req.headers.cookie, secret);
  if (!session) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, username: session.username });
});

module.exports = router;
