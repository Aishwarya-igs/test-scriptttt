/**
 * The restricted, read-only view a client-session login lands on — same
 * data shape as the admin's own GET /clients/:id/detail, but scoped
 * entirely to req.clientId from the verified client session (see
 * lib/requireClientAuth.js), never to an :id taken from the URL. A
 * client-scoped login can only ever see its own client this way, by
 * construction, not by a check that could be bypassed by editing the URL.
 *
 * `requireClientAuth` is applied per-route rather than as a blanket guard —
 * see routes/clients.js's header comment for why that's the correct
 * pattern when multiple routers share the literal /api prefix.
 */
const express = require('express');
const { requireClientAuth } = require('../lib/requireClientAuth');
const { getClient } = require('../lib/clients');
const { getClientDetail } = require('../lib/clientStats');

const router = express.Router();

router.get('/client-view/detail', requireClientAuth, (req, res) => {
  const client = getClient(req.clientId);
  if (!client) return res.status(404).json({ error: 'This client no longer exists' });
  res.json({ client, ...getClientDetail(client) });
});

module.exports = router;
