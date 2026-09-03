/**
 * Manage-other-admins panel. A new, separate router (not added onto
 * routes/auth.js) so the existing login/setup/logout/me routes stay exactly
 * as they were — this only adds list/remove for accounts other than the
 * one signed in right now.
 *
 * `requireAuth` is applied per-route rather than as a blanket guard ahead of
 * this whole router — see routes/clients.js's header comment for why a
 * router-wide guard on a router sharing the /api prefix with other routers
 * (public ones, and routes/clientView.js's own separately-guarded routes)
 * is the wrong pattern here.
 */
const express = require('express');
const { requireAuth } = require('../lib/requireAuth');
const { verifySessionCookie } = require('../lib/auth');
const { listAccountSummaries, deleteAccount } = require('../lib/adminAccount');

const router = express.Router();

router.get('/accounts', requireAuth, (_req, res) => {
  res.json({ accounts: listAccountSummaries() });
});

router.delete('/accounts/:username', requireAuth, (req, res) => {
  const secret = process.env.SESSION_SECRET;
  const session = secret && verifySessionCookie(req.headers.cookie, secret);
  if (session?.username === req.params.username) {
    return res.status(400).json({ error: "You can't remove the account you're currently signed in as." });
  }
  try {
    deleteAccount(req.params.username);
    res.json({ removed: req.params.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
