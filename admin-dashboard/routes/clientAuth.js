/**
 * Public login for a client's shared credential — separate from
 * routes/auth.js (admin login) entirely. Successfully authenticating here
 * only ever grants access to that one client's own read-only view
 * (routes/clientView.js), never the client registry or account management.
 */
const express = require('express');
const { findClientByCredentialUsername, verifyClientCredential } = require('../lib/clients');
const { createClientSessionCookie, clearClientSessionCookie, verifyClientSessionCookie } = require('../lib/clientSession');

const router = express.Router();

router.post('/client-login', (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Server is missing SESSION_SECRET — check admin-dashboard/.env' });
  }
  const { username, password } = req.body || {};
  const client = typeof username === 'string' ? findClientByCredentialUsername(username) : null;
  if (!client || !verifyClientCredential(client, password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  res.setHeader('Set-Cookie', createClientSessionCookie(secret, { clientId: client.id }));
  res.json({ authenticated: true, clientName: client.name });
});

router.post('/client-logout', (_req, res) => {
  res.setHeader('Set-Cookie', clearClientSessionCookie());
  res.json({ authenticated: false });
});

router.get('/client-session/me', (req, res) => {
  const secret = process.env.SESSION_SECRET;
  const session = secret && verifyClientSessionCookie(req.headers.cookie, secret);
  if (!session) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, clientId: session.clientId });
});

module.exports = router;
