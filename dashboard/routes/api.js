const express = require('express');
const fs = require('fs');
const { PROJECTS_MANIFEST } = require('../lib/paths');
const { askAboutHistory } = require('../lib/chat');
const { listPlatforms, isKnownPlatform } = require('../lib/platforms');

// A chat message is free text a human typed, not an id used in a file path
// or object-key lookup — the injection surface isSafeId guards against
// doesn't apply here. What matters is bounding size (a very long message
// could balloon token cost) and shape (history must be a real array of
// {role, content} turns, not arbitrary JSON handed straight to a prompt).
const MAX_CHAT_MESSAGE_LENGTH = 2000;

function validateChatBody(body) {
  if (typeof body?.message !== 'string' || !body.message.trim()) return 'message is required';
  if (body.message.length > MAX_CHAT_MESSAGE_LENGTH) return `message is too long (max ${MAX_CHAT_MESSAGE_LENGTH} characters)`;
  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) return 'history must be an array';
    for (const turn of body.history) {
      if (typeof turn?.content !== 'string' || (turn.role !== 'user' && turn.role !== 'assistant')) {
        return 'history entries must be { role: "user"|"assistant", content: string }';
      }
    }
  }
  return null;
}

// `env` and `project` end up as literal arguments in a shell-spawned
// `npx playwright test` command (see lib/processRunner.js), so they must be
// checked against the actual configured values before they ever reach
// spawn() — not just for injection, but so a typo gets a clean 400 instead
// of a confusing Playwright CLI failure three layers down.
function loadManifest() {
  return JSON.parse(fs.readFileSync(PROJECTS_MANIFEST, 'utf-8'));
}

function validateEnv(env, manifest) {
  const allowed = manifest.environments.map((e) => e.value);
  return allowed.includes(env) ? null : `env must be one of: ${allowed.join(', ')}`;
}

function validateProject(project, manifest) {
  if (!project) return null; // optional — omitted means "all projects"
  const allowed = manifest.projects.map((p) => p.name);
  return allowed.includes(project) ? null : `project must be one of: ${allowed.join(', ')}`;
}

// --grep takes a regex, so it legitimately needs characters like ()|[]$^ —
// it can't be locked down to alphanumerics. What it must never contain is a
// newline or NUL byte, which is enough to keep it a single well-formed CLI
// argument rather than something that could smuggle extra tokens in.
function validateGrep(grep) {
  if (!grep) return null;
  if (grep.length > 300) return 'grep is too long';
  if (/[\0\r\n]/.test(grep)) return 'grep contains invalid characters';
  return null;
}

/**
 * A route id (:runId, :testId) is used to build a file path or an object-key
 * lookup, never rendered or shell-escaped, so the only real threats are path
 * traversal (via ".." or a path separator) and prototype pollution (via
 * "__proto__"/"constructor"). Both are cheap to rule out up front.
 */
function isSafeId(id) {
  return typeof id === 'string' && /^[\w-]+$/.test(id) && id !== '__proto__' && id !== 'constructor';
}

// Registered per-param via router.param below, so `value`/`name` come from
// Express's own param-dispatch signature.
function requireSafeId(req, res, next, value, name) {
  if (!isSafeId(value)) return res.status(400).json({ error: `Invalid ${name}` });
  next();
}

/**
 * @param {import('../lib/runManager')} runManager
 * @param {import('../lib/autoUpdater').AutoUpdater} [autoUpdater]
 */
module.exports = function createApiRouter(runManager, autoUpdater) {
  const router = express.Router();
  router.param('runId', requireSafeId);
  router.param('testId', requireSafeId);

  router.get('/auto-update/status', (req, res) => {
    res.json(autoUpdater ? autoUpdater.getStatus() : { phase: 'idle' });
  });

  router.get('/projects', (req, res) => {
    res.json(loadManifest());
  });

  // Every platform the dashboard knows about, including ones declared but not
  // yet pointed at a repo — the UI needs those to render an honest "nothing
  // wired up yet" page rather than an empty one. See lib/platforms.js.
  router.get('/platforms', (req, res) => {
    res.json({ platforms: listPlatforms() });
  });

  router.get('/runs', (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const platform = req.query.platform;
    // An unknown platform is a 400 rather than an empty list: silently
    // returning nothing for a typo looks exactly like "this platform has no
    // runs", which is the one distinction these pages exist to make.
    if (platform !== undefined && !isKnownPlatform(platform)) {
      return res.status(400).json({ error: `Unknown platform "${platform}"` });
    }
    res.json(runManager.listRuns(limit, { platform: platform || null }));
  });

  router.get('/runs/:runId', (req, res) => {
    const run = runManager.loadRun(req.params.runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  });

  router.post('/runs', (req, res) => {
    const { env, project, grep } = req.body || {};
    if (!env) return res.status(400).json({ error: 'env is required' });
    const manifest = loadManifest();
    const error =
      validateEnv(env, manifest) || validateProject(project, manifest) || validateGrep(grep);
    if (error) return res.status(400).json({ error });
    const runId = runManager.start({ env, project, grep });
    res.status(202).json({ runId });
  });

  // Kept above '/runs/:runId/rerun': both are 3-segment POST paths
  // (runs/X/rerun), and Express resolves routes in registration order, so a
  // literal 'last-failed' segment must be matched before ':runId' has the
  // chance to swallow it.
  router.post('/runs/last-failed/rerun', (req, res) => {
    const { env, project } = req.body || {};
    if (!env) return res.status(400).json({ error: 'env is required' });
    const manifest = loadManifest();
    const error = validateEnv(env, manifest) || validateProject(project, manifest);
    if (error) return res.status(400).json({ error });
    const runId = runManager.rerunLastFailed({ env, project });
    res.status(202).json({ runId });
  });

  router.post('/runs/:runId/stop', (req, res) => {
    const ok = runManager.stop(req.params.runId);
    if (!ok) return res.status(404).json({ error: 'Run not found' });
    res.json({ ok: true });
  });

  // Kills only the currently-wedged module and continues with the rest of
  // the queue — the alternative to /stop when the run isn't meant to end,
  // just recover from one stuck module. See runManager.skipStalledJob.
  router.post('/runs/:runId/skip-stalled', (req, res) => {
    const ok = runManager.skipStalledJob(req.params.runId);
    if (!ok) return res.status(400).json({ error: 'No stuck module to skip on this run right now' });
    res.json({ ok: true });
  });

  // Kills the wedged file's job AND immediately retries just that file,
  // merging the outcome back onto this run once it finishes — so a stall
  // partway through a large module doesn't cost a restart from test 1 or a
  // second run to reconcile. See runManager.retryStalledJob.
  router.post('/runs/:runId/retry-stalled', (req, res) => {
    const ok = runManager.retryStalledJob(req.params.runId);
    if (!ok) {
      return res
        .status(400)
        .json({ error: 'No stuck module to retry on this run right now (or its file target is unknown)' });
    }
    res.json({ ok: true });
  });

  router.post('/runs/:runId/rerun', (req, res) => {
    const { scope, target } = req.body || {};
    if (!['test', 'file', 'project', 'all-failed'].includes(scope)) {
      return res.status(400).json({ error: 'scope must be one of test|file|project|all-failed' });
    }
    try {
      const runId = runManager.rerun(req.params.runId, { scope, target });
      res.status(202).json({ runId });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Read-only: every past run where this exact test case showed up (matched
  // by ticket id, not file+line — see dashboard/lib/testCaseIdentity.js),
  // with what RCA/spot-fix concluded each time.
  router.get('/runs/:runId/tests/:testId/history', (req, res) => {
    try {
      const result = runManager.getTestCaseHistory(req.params.runId, req.params.testId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/runs/:runId/tests/:testId/analyze', async (req, res) => {
    try {
      const rca = await runManager.analyzeTest(req.params.runId, req.params.testId);
      res.json(rca);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Generates a spot-fix proposal. Deliberately read-only with respect to the
  // working tree — /spot-fix/apply below is the only endpoint that writes.
  router.post('/runs/:runId/tests/:testId/spot-fix', async (req, res) => {
    try {
      const proposal = await runManager.proposeSpotFix(req.params.runId, req.params.testId);
      res.json(proposal);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Writes the reviewed proposal to disk, optionally rerunning the test after.
  router.post('/runs/:runId/tests/:testId/spot-fix/apply', (req, res) => {
    try {
      const result = runManager.applySpotFix(req.params.runId, req.params.testId, {
        rerun: Boolean(req.body?.rerun),
        // Provisional apply: kept only if the rerun comes back green.
        verify: Boolean(req.body?.verify),
        // Required when the proposal has a high-severity risk (see risk.js)
        // — a deliberate, separate signal from clicking Apply itself.
        acknowledgeRisks: Boolean(req.body?.acknowledgeRisks),
      });
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.post('/runs/:runId/tests/:testId/spot-fix/revert', (req, res) => {
    try {
      const result = runManager.revertSpotFix(req.params.runId, req.params.testId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // (Re)generates the proactive plain-English run summary. Runs also get one
  // automatically on completion (see runManager._generateRunSummaryAsync) —
  // this is for regenerating it, or for runs that finished before the
  // feature existed and so never got one.
  router.post('/runs/:runId/summary', async (req, res) => {
    try {
      const summary = await runManager.generateRunSummaryNow(req.params.runId);
      res.json(summary);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Conversational Q&A over run history — stateless on the server (the
  // client resends prior turns as `history` each time), consistent with the
  // rest of this API. Read-only: nothing here can write to a run or the
  // working tree.
  router.post('/chat', async (req, res) => {
    const validationError = validateChatBody(req.body);
    if (validationError) return res.status(400).json({ error: validationError });
    try {
      const result = await askAboutHistory(req.body.message, req.body.history || []);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Bulk-clears run history. Kept above the ':runId' routes so that adding a
  // POST /runs/:runId later can't start swallowing "clear" as a run id.
  router.post('/runs/clear', (req, res) => {
    const keepLast = Number(req.body?.keepLast) || 0;
    if (keepLast < 0) return res.status(400).json({ error: 'keepLast must be zero or greater' });
    try {
      res.json(runManager.clearRuns({ keepLast }));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.delete('/runs/:runId', (req, res) => {
    try {
      runManager.deleteRun(req.params.runId);
      res.json({ ok: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Every spot fix currently applied to the working tree, across all runs —
  // what backs the "uncommitted spot fixes" banner.
  router.get('/spot-fixes', (req, res) => {
    res.json(runManager.listAppliedSpotFixes());
  });

  // Revert by registry id, so undo works without knowing the originating run.
  router.post('/spot-fixes/:id/revert', (req, res) => {
    try {
      res.json(runManager.revertAppliedSpotFix(req.params.id));
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Ingestion endpoint for dashboard/reporter/dashboard-reporter.js running inside a spawned job.
  router.post('/internal/run-events', (req, res) => {
    runManager.ingestEvent(req.body || {});
    res.status(204).end();
  });

  return router;
};
