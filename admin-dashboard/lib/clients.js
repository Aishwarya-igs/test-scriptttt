/**
 * The admin-onboarded client registry — this app's one piece of durable,
 * authoritative data (everything else it shows is read live from each
 * client's own dashboard/data). A plain JSON file rather than a database:
 * there's no volume here that needs indexing, and it mirrors the same
 * registry pattern dashboard/lib/spotfix/registry.js already uses for
 * exactly this kind of small, admin-managed list.
 */
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const { CLIENTS_FILE, CLIENT_REPOS_DIR } = require('./paths');
const { createCredential, verifyCredential } = require('./clientCredentials');
const { provisionDashboard, stopDashboardOnPort } = require('./dashboardProvisioner');

const execFileAsync = promisify(execFile);

// Ids end up in URLs — keep them boring, same rule dashboard/lib/platforms.js
// already applies to its own ids.
const ID_RE = /^[a-z][a-z0-9-]{0,40}$/;

/** Never throws: a missing or corrupt registry must not crash the app. */
function readAll() {
  try {
    const parsed = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(clients) {
  fs.mkdirSync(path.dirname(CLIENTS_FILE), { recursive: true });
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf-8');
}

/**
 * Applies `mutate` to a freshly-read copy of the registry, then writes the
 * result — never a caller's own possibly-stale snapshot. Matters most for
 * createClient/updateClient, whose clone/npm-install/build work can take
 * several minutes: a stale writeAll([...snapshotFromMinutesAgo, ...]) at the
 * end silently overwrites and loses any OTHER write (an edit, an archive,
 * another onboarding) that landed in that window. Confirmed the hard way —
 * an in-flight onboarding's stale snapshot deleted an already-onboarded
 * client that had been removed and re-created while it was still running.
 * `mutate` may throw to abort without writing (e.g. a genuine id collision
 * from two concurrent onboardings); that propagates to the caller as-is.
 */
function mergeWrite(mutate) {
  const fresh = readAll();
  const next = mutate(fresh);
  writeAll(next);
  return next;
}

function slugify(name) {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'client';
}

function uniqueId(base, existingIds) {
  if (!existingIds.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!existingIds.has(candidate)) return candidate;
  }
}

/**
 * Strips the shared-login credential down to a presence flag before a
 * client record goes into the general listing/detail responses. The full
 * credential (including the plaintext password) is only ever returned by
 * the dedicated GET /clients/:id/credential route the "Share access" panel
 * calls explicitly — not on every page load of the overview grid.
 */
function toPublicClient(client) {
  if (!client) return client;
  const { credential, ...rest } = client;
  return { ...rest, hasCredential: Boolean(credential) };
}

/** Public-facing list, newest first, archived hidden unless asked for. */
function listClients({ includeArchived = false } = {}) {
  const all = readAll();
  const filtered = includeArchived ? all : all.filter((c) => !c.archivedAt);
  return [...filtered].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map(toPublicClient);
}

function getClient(id) {
  return toPublicClient(readAll().find((c) => c.id === id) || null);
}

/** Internal/full record, credential included — for routes/clients.js's dedicated credential endpoints and for updateClient/archiveClient below, never sent to the browser as-is. */
function getClientRaw(id) {
  return readAll().find((c) => c.id === id) || null;
}

/**
 * Validates repoPath is an absolute, existing directory before ever storing
 * it — an admin onboarding a client is registering a filesystem fact, and a
 * typo'd path should fail loudly here, not surface later as a silent "no
 * data yet" on the overview card.
 *
 * Normalizes first: Windows Explorer's "Copy as path" wraps the clipboard
 * value in literal double quotes, and a pasted path often carries leading/
 * trailing whitespace — both make an otherwise-valid absolute path fail
 * path.isAbsolute() for reasons invisible to whoever pasted it. Strips a
 * single matching pair of quotes and trims before validating, and returns
 * the resolved path so callers store the cleaned value, not the raw input.
 */
function assertValidRepoPath(repoPath) {
  if (typeof repoPath !== 'string' || !repoPath.trim()) {
    throw new Error('repoPath is required');
  }
  let cleaned = repoPath.trim();
  if (cleaned.length >= 2 && ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'")))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // A git remote URL is the most common thing someone pastes here by
  // mistake — this app registers an already-cloned local folder, it never
  // clones one itself, so point that mistake at the actual fix instead of
  // the generic "must be an absolute path" message.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(cleaned) || /^git@/i.test(cleaned)) {
    throw new Error('repoPath must be a local folder on this machine, not a git URL — clone the repo locally first, then enter that folder\'s path here');
  }
  if (!path.isAbsolute(cleaned)) {
    throw new Error('repoPath must be an absolute path');
  }
  let stat;
  try {
    stat = fs.statSync(cleaned);
  } catch {
    throw new Error(`repoPath does not exist: ${cleaned}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`repoPath is not a directory: ${cleaned}`);
  }
  return path.resolve(cleaned);
}

const GIT_URL_RE = /^(https?:\/\/|git@)\S+$/i;

/** Onboarding takes a git URL, not a local path — same quote/whitespace cleanup as assertValidRepoPath, for the same reason (a pasted URL carries the same copy/paste artifacts). */
function assertValidRepoUrl(repoUrl) {
  if (typeof repoUrl !== 'string' || !repoUrl.trim()) {
    throw new Error('repoUrl is required');
  }
  let cleaned = repoUrl.trim();
  if (cleaned.length >= 2 && ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'")))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (path.isAbsolute(cleaned) || /^[a-zA-Z]:[\\/]/.test(cleaned)) {
    throw new Error('repoUrl must be a git repository URL (e.g. https://github.com/org/repo.git), not a local folder path');
  }
  if (!GIT_URL_RE.test(cleaned)) {
    throw new Error('repoUrl must be a git repository URL, e.g. https://github.com/org/repo.git or git@github.com:org/repo.git');
  }
  return cleaned;
}

/**
 * Clones repoUrl into data/client-repos/<id> — this is what lets onboarding
 * take a GitHub URL directly instead of requiring the admin to clone it
 * somewhere by hand first and paste back a local path (the friction that
 * motivated this: a manual clone/extract/paste round trip is exactly what
 * produced duplicate/nested folders and stale paths in practice).
 *
 * Shallow clone (--depth 1): this app only ever reads a client's current
 * dashboard/data on disk, never its git history, so the full history isn't
 * worth the extra clone time or disk space.
 *
 * Async (not execFileSync): onboarding now also npm-installs and builds a
 * full dashboard instance afterward (see provisionDashboard below), which
 * can take minutes — running any of this synchronously would freeze the
 * whole admin-dashboard process, blocking every other admin's request for
 * that entire time, not just the one onboarding it. An async child process
 * still makes the *request* wait for its own result, but frees the event
 * loop for everyone else in the meantime.
 *
 * Preserves an existing dashboard/ subfolder across a re-clone (e.g. from
 * updateClient's repoUrl edit path): that subfolder is this client's already
 * *provisioned* Automation Dashboard (source, and — critically — its own
 * run history under dashboard/data), not part of what came from repoUrl.
 * Wiping it here would silently delete a working dashboard and its history
 * every time an admin merely fixes a typo'd URL.
 */
async function cloneRepo(id, repoUrl) {
  const targetDir = path.join(CLIENT_REPOS_DIR, id);
  const preservedDashboardDir = path.join(CLIENT_REPOS_DIR, `.preserved-dashboard-${id}`);
  fs.mkdirSync(CLIENT_REPOS_DIR, { recursive: true });

  const existingDashboardDir = path.join(targetDir, 'dashboard');
  const hadDashboard = fs.existsSync(existingDashboardDir);
  if (hadDashboard) {
    fs.rmSync(preservedDashboardDir, { recursive: true, force: true });
    fs.renameSync(existingDashboardDir, preservedDashboardDir);
  }
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  try {
    await execFileAsync('git', ['clone', '--depth', '1', repoUrl, targetDir], { timeout: 120_000, windowsHide: true });
  } catch (err) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    if (hadDashboard) fs.renameSync(preservedDashboardDir, existingDashboardDir);
    const detail = (err.stderr || err.message || '').toString().trim().split('\n').slice(-4).join(' ');
    if (err.killed || err.signal === 'SIGTERM') {
      throw new Error('Cloning that repo took too long and timed out — check the URL and your network connection.');
    }
    throw new Error(`Could not clone that repo: ${detail || 'unknown git error'}`);
  }
  if (hadDashboard) {
    fs.renameSync(preservedDashboardDir, existingDashboardDir);
  }
  return path.resolve(targetDir);
}

/**
 * Two different clients sharing a dashboardUrl is exactly the bug that let
 * one client's "Open Automation Dashboard" button silently open a
 * *different* client's real data. Rather than trust an admin to type a
 * unique one into a form (the earlier version of this did, and it's how the
 * collision happened in the first place), a fresh client's dashboardUrl is
 * allocated automatically — the next free 127.0.0.1 port after 4300 among
 * every currently-active client, so it's unique by construction. The admin
 * only needs to actually start that client's Automation Dashboard on the
 * port it's given (shown on the card), not choose or remember one.
 */
const DASHBOARD_URL_BASE_PORT = 4300;

function allocateDashboardUrl(all) {
  const usedPorts = new Set(
    all
      .filter((c) => !c.archivedAt)
      .map((c) => Number(/:(\d+)\s*$/.exec(c.dashboardUrl || '')?.[1]))
      .filter((p) => Number.isFinite(p))
  );
  let port = DASHBOARD_URL_BASE_PORT;
  while (usedPorts.has(port)) port += 1;
  return `http://127.0.0.1:${port}`;
}

/** Still enforced for the direct-API edit path (not exposed as a form field), so a manual PATCH can never reintroduce the collision either. */
function assertValidDashboardUrl(dashboardUrl, { excludeId } = {}) {
  if (typeof dashboardUrl !== 'string' || !dashboardUrl.trim()) {
    throw new Error('dashboardUrl is required — each client needs its own Automation Dashboard address');
  }
  const trimmed = dashboardUrl.trim();
  const all = readAll();
  const collision = all.find((c) => !c.archivedAt && c.id !== excludeId && c.dashboardUrl === trimmed);
  if (collision) {
    throw new Error(`That dashboard URL is already used by "${collision.name}" — each client needs its own, or opening one client's button would open another's dashboard`);
  }
  return trimmed;
}

/** Optional — a client with none set just doesn't get failure-notification emails (see dashboard/lib/notifyOnFailure.js). Loose check on purpose: this only ever feeds an email API's `to` field, not a security boundary. */
function assertValidEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('That does not look like a valid email address');
  }
  return trimmed;
}

/**
 * Onboarding takes a git URL and clones it (see cloneRepo above) rather than
 * requiring the admin to already have a local checkout — the manual clone/
 * extract/copy-path round trip that used to require is exactly what produced
 * duplicate and stale paths in practice.
 *
 * Also provisions and starts that client's own live Automation Dashboard
 * (see dashboardProvisioner.js) — the same real, "Start Run"-capable
 * dashboard the iWantTFC demo has, on the port already allocated below.
 * Onboarding is all-or-nothing: if cloning or provisioning fails at any
 * step, the cloned repo (and any partial dashboard install inside it) is
 * removed and nothing is written to the registry, rather than leaving a
 * client that exists but doesn't actually work.
 */
async function createClient({ name, repoUrl, description = '', email = '' }) {
  if (typeof name !== 'string' || !name.trim()) throw new Error('name is required');
  const validRepoUrl = assertValidRepoUrl(repoUrl);
  const validEmail = assertValidEmail(email);

  const existingIds = new Set(readAll().map((c) => c.id));
  const id = uniqueId(slugify(name), existingIds);
  if (!ID_RE.test(id)) throw new Error('Could not derive a valid id from that name');

  const clonedPath = await cloneRepo(id, validRepoUrl);
  const validRepoPath = assertValidRepoPath(clonedPath);
  // Re-read rather than reuse the snapshot from above: cloning can take a
  // while, and allocating a port from a stale list is exactly how two
  // clients ended up sharing one (see mergeWrite's doc comment) — reading
  // again right before allocating shrinks that window as much as this
  // function's own structure allows (provisioning below is the slower,
  // remaining part of it).
  const dashboardUrl = allocateDashboardUrl(readAll());

  const now = new Date().toISOString();
  const client = {
    id,
    name: name.trim(),
    repoUrl: validRepoUrl,
    repoPath: validRepoPath,
    description: typeof description === 'string' ? description.trim() : '',
    email: validEmail,
    dashboardUrl,
    // One shared login for this client's team, generated the moment it's
    // onboarded — see lib/clientCredentials.js and the "Share access" panel.
    credential: createCredential(id),
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };

  try {
    await provisionDashboard(client);
  } catch (err) {
    fs.rmSync(clonedPath, { recursive: true, force: true });
    throw new Error(`Cloned the repo, but couldn't set up its dashboard: ${err.message}`);
  }

  try {
    mergeWrite((fresh) => {
      if (fresh.some((c) => c.id === id)) {
        throw new Error(`A client with id "${id}" already exists (likely a concurrent onboarding) — try again`);
      }
      return [...fresh, client];
    });
  } catch (err) {
    fs.rmSync(clonedPath, { recursive: true, force: true });
    throw err;
  }
  return toPublicClient(client);
}

/** For the client-login endpoint: finds whichever active client this shared username belongs to. */
function findClientByCredentialUsername(username) {
  return readAll().find((c) => !c.archivedAt && c.credential?.username === username) || null;
}

function verifyClientCredential(client, password) {
  return verifyCredential(client?.credential, password);
}

/**
 * Rotates a client's shared password — the old one stops working
 * immediately, same posture as any credential rotation. Returns the raw
 * record (credential included, plaintext password and all) on purpose:
 * this is the one explicit action where the admin needs the fresh password
 * back immediately to re-share it, the same as the dedicated credential-GET
 * route — never returned from the general listing/update endpoints.
 */
function regenerateCredential(id) {
  let result;
  mergeWrite((fresh) => {
    const idx = fresh.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Unknown client: ${id}`);
    fresh[idx] = { ...fresh[idx], credential: createCredential(id), updatedAt: new Date().toISOString() };
    result = fresh[idx];
    return fresh;
  });
  return result;
}

/**
 * repoUrl is the normal edit path (mirrors createClient — see cloneRepo's
 * doc comment for why re-cloning beats asking for a local path). Re-clones
 * only if the URL actually changed from what's stored, so editing just the
 * name/description on every save doesn't re-clone for no reason.
 *
 * Known gap: unlike createClient, a URL change here does NOT re-provision
 * that client's dashboard (it would still be running against the old
 * checkout's dashboard/ folder, which a re-clone leaves untouched since only
 * the rest of the repo gets wiped and replaced — dashboard/ itself isn't
 * part of the clone). Re-provisioning here would also need to stop whatever
 * is currently running on that port first. Out of scope for now: this path
 * is for fixing a wrong URL shortly after onboarding, not a routine flow.
 *
 * repoPath stays supported too, but only for the direct-API edit path (not
 * exposed as a form field) — same posture as assertValidDashboardUrl above —
 * for pointing at a local checkout that didn't come from onboarding's clone.
 */
async function updateClient(id, patch) {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Unknown client: ${id}`);
  const current = all[idx];

  let repoUpdate = {};
  if (patch.repoUrl !== undefined) {
    const validRepoUrl = assertValidRepoUrl(patch.repoUrl);
    if (validRepoUrl !== current.repoUrl) {
      const clonedPath = await cloneRepo(id, validRepoUrl);
      repoUpdate = { repoUrl: validRepoUrl, repoPath: assertValidRepoPath(clonedPath) };
    }
  } else if (patch.repoPath !== undefined) {
    repoUpdate = { repoPath: assertValidRepoPath(patch.repoPath) };
  }
  const validDashboardUrl = patch.dashboardUrl !== undefined ? assertValidDashboardUrl(patch.dashboardUrl, { excludeId: id }) : undefined;
  const validEmail = patch.email !== undefined ? assertValidEmail(patch.email) : undefined;

  // Merged onto a fresh read (see mergeWrite's doc comment), not the
  // `current`/`all` snapshot from the top of this function — the repoUrl
  // path above can take minutes (re-cloning), long enough for another
  // write to land in between that a stale writeAll would otherwise erase.
  let result;
  mergeWrite((fresh) => {
    const freshIdx = fresh.findIndex((c) => c.id === id);
    if (freshIdx === -1) throw new Error(`Unknown client: ${id} (it may have just been removed)`);
    const next = {
      ...fresh[freshIdx],
      ...(patch.name !== undefined ? { name: String(patch.name).trim() } : {}),
      ...repoUpdate,
      ...(patch.description !== undefined ? { description: String(patch.description).trim() } : {}),
      ...(validEmail !== undefined ? { email: validEmail } : {}),
      ...(validDashboardUrl !== undefined ? { dashboardUrl: validDashboardUrl } : {}),
      updatedAt: new Date().toISOString(),
    };
    fresh[freshIdx] = next;
    result = next;
    return fresh;
  });
  return toPublicClient(result);
}

/**
 * Soft-delete only — an admin's onboarding history is worth keeping, same
 * posture as dashboard/lib/runManager.js's refusal to hard-delete. The repo
 * clone and its dashboard/ folder are left on disk too, same reasoning.
 *
 * Does stop that client's live dashboard server, though (see
 * stopDashboardOnPort) — it was started detached specifically so it'd
 * outlive everything else about the client, which means archiving is the
 * only thing that will ever stop it otherwise.
 */
async function archiveClient(id) {
  const current = readAll().find((c) => c.id === id);
  if (!current) throw new Error(`Unknown client: ${id}`);
  if (current.dashboardUrl) await stopDashboardOnPort(current.dashboardUrl);

  // Merged onto a fresh read (see mergeWrite's doc comment) — stopping the
  // dashboard process above is a couple of PowerShell round trips, small
  // but non-zero, so the same staleness risk applies even here.
  let result;
  mergeWrite((fresh) => {
    const idx = fresh.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Unknown client: ${id} (it may have just been removed)`);
    fresh[idx] = { ...fresh[idx], archivedAt: new Date().toISOString() };
    result = fresh[idx];
    return fresh;
  });
  return toPublicClient(result);
}

module.exports = {
  listClients,
  getClient,
  getClientRaw,
  createClient,
  updateClient,
  archiveClient,
  findClientByCredentialUsername,
  verifyClientCredential,
  regenerateCredential,
};
