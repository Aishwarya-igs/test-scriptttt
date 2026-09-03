/**
 * The set of platforms this dashboard can show runs for — web today, mobile
 * and TV once those repos exist.
 *
 * Read from config/platforms.json rather than hardcoded so adding a platform
 * is a config edit, not a code change across the frontend nav, the routes and
 * the run store. The whole point of the registry is that the dashboard stops
 * being "the dashboard for THIS repo".
 *
 * A platform with no `repoRoot` is DECLARED but NOT CONFIGURED: it appears in
 * the nav and gets a page, and that page says plainly that nothing is wired
 * up yet. That distinction is the reason this exists as a registry at all —
 * "no runs yet" and "this platform has nowhere to read runs from" look
 * identical in a UI that only counts runs, and they need completely
 * different actions from whoever is looking.
 *
 * Nothing here changes how tests are RUN or how RCA/spot-fix resolve source
 * files; both still work against the single repo this dashboard lives in
 * (see lib/paths.js REPO_ROOT). Making those per-platform is the next step,
 * and is deliberately not attempted until there is a real second repo to
 * verify it against.
 */
const fs = require('fs');
const path = require('path');
const { DASHBOARD_ROOT } = require('./paths');

const CONFIG_FILE = path.join(DASHBOARD_ROOT, 'config', 'platforms.json');

// Every run recorded before platforms existed belongs to the web suite, and
// every code path that does not yet know about platforms writes this.
const DEFAULT_PLATFORM_ID = 'web';

// Ids end up in URLs and in run records, and are compared against directory
// and file names — keep them boring.
const ID_RE = /^[a-z][a-z0-9-]{0,30}$/;

const FALLBACK = {
  id: DEFAULT_PLATFORM_ID,
  label: 'Web',
  icon: '🖥',
  repoRoot: path.resolve(DASHBOARD_ROOT, '..'),
  description: '',
  configured: true,
  canRun: true,
};

function readConfig() {
  let text;
  try {
    text = fs.readFileSync(CONFIG_FILE, 'utf-8');
  } catch {
    return null; // no registry yet — fall back to web-only
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    // Same posture as projectConventions: a malformed override must not
    // silently degrade to a default, or whoever wrote it never finds out why
    // their platform is missing.
    throw new Error(`${CONFIG_FILE} is not valid JSON: ${err.message}`);
  }
}

/**
 * `repoRoot` is resolved against the dashboard directory so a relative path
 * in the config (".." for the repo this lives in, "../../iwanttfc-mobile"
 * for a sibling checkout) means the same thing regardless of where the server
 * was started from.
 *
 * `configured` requires the directory to actually EXIST, not merely to be
 * named. A path pointing at a repo that was never cloned is exactly as
 * unusable as no path at all, and reporting it as ready would produce a page
 * that looks wired up and silently shows nothing.
 *
 * `canRun` is narrower than `configured` on purpose: the runner still spawns
 * Playwright in this repo (lib/paths.js REPO_ROOT) whatever platform is asked
 * for, so only the default platform can honestly offer a Start-run form. The
 * day the runner takes a platform's repoRoot, this becomes `configured` and
 * the form appears on every wired-up platform with no UI change.
 */
function normalize(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const id = typeof entry.id === 'string' ? entry.id.trim() : '';
  if (!ID_RE.test(id)) return null;

  let repoRoot = null;
  let configured = false;
  if (typeof entry.repoRoot === 'string' && entry.repoRoot.trim()) {
    repoRoot = path.resolve(DASHBOARD_ROOT, entry.repoRoot.trim());
    try {
      configured = fs.statSync(repoRoot).isDirectory();
    } catch {
      configured = false;
    }
  }

  return {
    id,
    label: typeof entry.label === 'string' && entry.label.trim() ? entry.label.trim() : id,
    icon: typeof entry.icon === 'string' ? entry.icon : '',
    description: typeof entry.description === 'string' ? entry.description : '',
    repoRoot,
    configured,
    canRun: configured && id === DEFAULT_PLATFORM_ID,
  };
}

let cached = null;

/** Every declared platform, in config order. Always contains at least `web`. */
function listPlatforms({ reload = false } = {}) {
  if (cached && !reload) return cached;

  const config = readConfig();
  const raw = Array.isArray(config?.platforms) ? config.platforms : [];
  const seen = new Set();
  const platforms = [];
  for (const entry of raw) {
    const normalized = normalize(entry);
    if (!normalized || seen.has(normalized.id)) continue;
    seen.add(normalized.id);
    platforms.push(normalized);
  }

  // The dashboard must always have somewhere to put a run, including when the
  // registry is missing, empty, or malformed enough that nothing survived
  // normalisation.
  if (!platforms.some((p) => p.id === DEFAULT_PLATFORM_ID)) platforms.unshift({ ...FALLBACK });

  cached = platforms;
  return cached;
}

function getPlatform(id) {
  return listPlatforms().find((p) => p.id === id) || null;
}

/** True for an id that names a declared platform — for validating route params. */
function isKnownPlatform(id) {
  return typeof id === 'string' && listPlatforms().some((p) => p.id === id);
}

/**
 * The platform a run belongs to. Runs recorded before the registry existed
 * carry no `platform`, and they were all web — treating them as such keeps
 * existing history visible instead of stranding it under a platform nobody
 * selected.
 */
function platformOfRun(run) {
  const id = run?.platform;
  return isKnownPlatform(id) ? id : DEFAULT_PLATFORM_ID;
}

module.exports = {
  listPlatforms,
  getPlatform,
  isKnownPlatform,
  platformOfRun,
  DEFAULT_PLATFORM_ID,
  PLATFORMS_CONFIG_FILE: CONFIG_FILE,
};
