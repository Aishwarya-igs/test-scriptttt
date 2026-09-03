/**
 * Every route here is admin-only. `requireAuth` is applied per-route (not
 * as a blanket router.use()/app.use() guard) on purpose: this router shares
 * the literal /api prefix with public routes (routes/auth.js,
 * routes/clientAuth.js) and the separately-guarded routes/clientView.js. A
 * guard applied ahead of the whole router runs for *any* /api/* request
 * that reaches this mount point, before Express ever checks whether one of
 * this router's own routes actually matches — which would 401 requests
 * meant for a completely different router (this was a real bug: it
 * rejected /api/client-view/detail before requireClientAuth ever got a
 * chance to run). Attached per-route, it only ever fires once a specific
 * route here has already matched.
 */
const express = require('express');
const { requireAuth } = require('../lib/requireAuth');
const { listClients, getClient, getClientRaw, createClient, updateClient, archiveClient, regenerateCredential } = require('../lib/clients');
const { getClientStats, getClientDetail, getOverviewStats } = require('../lib/clientStats');

const router = express.Router();

/** The consolidated, weighted rollup across every onboarded client — what the admin sees first. */
router.get('/overview', requireAuth, (_req, res) => {
  res.json(getOverviewStats(listClients()));
});

// Same shape as dashboard/routes/api.js's requireSafeId: an unknown/malformed
// id is a clean 404, not a path fragment leaking into a filesystem lookup.
router.param('id', (req, res, next, id) => {
  if (typeof id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid client id' });
  }
  next();
});

router.get('/clients', requireAuth, (req, res) => {
  res.json({ clients: listClients({ includeArchived: req.query.includeArchived === 'true' }) });
});

router.post('/clients', requireAuth, async (req, res) => {
  try {
    const client = await createClient(req.body || {});
    res.status(201).json({ client });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/clients/:id', requireAuth, (req, res) => {
  const client = getClient(req.params.id);
  if (!client) return res.status(404).json({ error: 'Unknown client' });
  res.json({ client });
});

router.get('/clients/:id/stats', requireAuth, (req, res) => {
  const client = getClient(req.params.id);
  if (!client) return res.status(404).json({ error: 'Unknown client' });
  res.json({ stats: getClientStats(client) });
});

/** The drill-down page's data: same stats plus recent runs and cross-run flaky tests. */
router.get('/clients/:id/detail', requireAuth, (req, res) => {
  const client = getClient(req.params.id);
  if (!client) return res.status(404).json({ error: 'Unknown client' });
  res.json({ client, ...getClientDetail(client) });
});

/**
 * The "Share access" panel's data: the shared login (plaintext password
 * included) for exactly one client, fetched on demand — never bundled into
 * the general listing. Lazily provisions a credential for a client that
 * predates this feature, rather than erroring.
 */
router.get('/clients/:id/credential', requireAuth, (req, res) => {
  let client = getClientRaw(req.params.id);
  if (!client) return res.status(404).json({ error: 'Unknown client' });
  if (!client.credential) client = regenerateCredential(req.params.id);
  res.json({ credential: client.credential });
});

router.post('/clients/:id/credential/regenerate', requireAuth, (req, res) => {
  try {
    const client = regenerateCredential(req.params.id);
    res.json({ credential: client.credential });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await updateClient(req.params.id, req.body || {});
    res.json({ client });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await archiveClient(req.params.id);
    res.json({ client });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
