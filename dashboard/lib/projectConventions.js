/**
 * Where this project keeps its tests, page objects and business functions —
 * discovered, not hardcoded.
 *
 * The RCA/spot-fix engine used to name `src/pom`, `src/businessFunction`,
 * `tests/` and `src/` literally, in four different modules. That made the
 * engine a feature of THIS repo rather than a component that can be pointed
 * at another Playwright suite: a project that keeps page objects in
 * `e2e/pages` got no locator catalog, no helper resolution, and no editable
 * root — silently, with the failure surfacing much later as "the model
 * invented a method" or "could not locate any editable source file".
 *
 * Resolution order:
 *   1. dashboard/config/project-conventions.json, if present — an explicit
 *      escape hatch for a layout too unusual to detect (paths are relative to
 *      the repo root).
 *   2. Detection: walk the repo (shallow, ignoring build output) and classify
 *      directories by name and by what they contain.
 *   3. The historical defaults (tests/, src/, src/pom, src/businessFunction),
 *      so a repo that detection cannot read behaves exactly as it did before.
 *
 * editableRoots is a security boundary as well as a convenience — it is what
 * resolveEditableFile refuses to write outside of — so detection deliberately
 * never widens it to the repo root itself, and never includes the dashboard's
 * own source.
 */
const fs = require('fs');
const path = require('path');
const { REPO_ROOT, DASHBOARD_ROOT } = require('./paths');

const CONFIG_FILE = path.join(DASHBOARD_ROOT, 'config', 'project-conventions.json');

const SOURCE_EXT = new Set(['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs']);
const SPEC_RE = /\.(spec|test)\.[mc]?[jt]sx?$/i;

// Never walked into: build output, dependencies, run artifacts, and the
// dashboard itself (its own lib/ is full of .js that is not under test).
const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.github', '.vscode', '.idea', 'dist', 'build', 'out',
  'coverage', 'test-results', 'playwright-report', 'blob-report', '.next',
  '.cache', '.turbo', 'logs', 'dashboard',
]);

// Directory names that conventionally hold page objects / business functions.
// Matched case-insensitively against the directory's own name.
const PAGE_OBJECT_DIR_NAMES = new Set([
  'pom', 'poms', 'page-objects', 'pageobjects', 'pages', 'page', 'screens', 'po',
]);
const BUSINESS_FUNCTION_DIR_NAMES = new Set([
  'businessfunction', 'businessfunctions', 'business-functions', 'business-function',
  'bf', 'bfs', 'flows', 'workflows', 'actions', 'tasks',
]);

const MAX_DEPTH = 4;

/** Every directory under `root` that directly contains at least one source file. */
function walkSourceDirs(root) {
  const found = [];
  const visit = (dir, depth) => {
    if (depth > MAX_DEPTH) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        visit(path.join(dir, entry.name), depth + 1);
      } else if (entry.isFile() && SOURCE_EXT.has(path.extname(entry.name))) {
        files.push(entry.name);
      }
    }
    if (files.length) found.push({ dir, files });
  };
  visit(root, 0);
  return found;
}

// A page object is recognised by content as well as by folder name: a class
// whose name ends in Page/Screen/PageObject, which is the shape every
// Playwright POM guide produces regardless of where the file lives.
const PAGE_OBJECT_CLASS_RE = /\bclass\s+\w*(?:Page|Screen|PageObject)\b/;

function classifyDirs(sourceDirs) {
  const pageObjectDirs = new Set();
  const businessFunctionDirs = new Set();
  const specDirs = new Set();

  for (const { dir, files } of sourceDirs) {
    const name = path.basename(dir).toLowerCase();

    if (files.some((f) => SPEC_RE.test(f))) specDirs.add(dir);
    if (PAGE_OBJECT_DIR_NAMES.has(name)) pageObjectDirs.add(dir);
    if (BUSINESS_FUNCTION_DIR_NAMES.has(name)) businessFunctionDirs.add(dir);

    // Content-based fallback for page objects, so an unconventionally named
    // directory still gets a locator catalog. Capped: reading a handful of
    // heads is cheap, reading an entire repo is not.
    if (!pageObjectDirs.has(dir) && !SPEC_RE.test(files[0] || '')) {
      for (const file of files.slice(0, 12)) {
        if (SPEC_RE.test(file)) continue;
        let head;
        try {
          head = fs.readFileSync(path.join(dir, file), 'utf-8').slice(0, 4000);
        } catch {
          continue;
        }
        if (PAGE_OBJECT_CLASS_RE.test(head)) {
          pageObjectDirs.add(dir);
          break;
        }
      }
    }
  }

  return { pageObjectDirs, businessFunctionDirs, specDirs };
}

/**
 * The top-level repo directories a spot fix may write to: the shallowest
 * ancestor (directly under the repo root) of every directory that holds
 * specs, page objects or business functions.
 *
 * Deliberately coarse — the same "tests/ and src/" granularity as before —
 * because helper files a fix legitimately needs to touch (utils, types,
 * fixtures, data) sit alongside page objects rather than inside them.
 */
function deriveEditableRoots(dirs) {
  const roots = new Set();
  for (const dir of dirs) {
    const rel = path.relative(REPO_ROOT, dir);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) continue;
    const top = rel.split(path.sep)[0];
    if (!top || IGNORED_DIRS.has(top)) continue;
    roots.add(path.join(REPO_ROOT, top));
  }
  return roots;
}

const existingDirs = (list) => list.filter((d) => {
  try {
    return fs.statSync(d).isDirectory();
  } catch {
    return false;
  }
});

function resolveAll(rawPaths) {
  if (!Array.isArray(rawPaths)) return [];
  return rawPaths
    .filter((p) => typeof p === 'string' && p.trim())
    .map((p) => path.resolve(REPO_ROOT, p.trim()));
}

function readConfigFile() {
  let text;
  try {
    text = fs.readFileSync(CONFIG_FILE, 'utf-8');
  } catch {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    // A malformed override must not silently degrade to detection — the
    // person who wrote it would never find out why their layout was ignored.
    throw new Error(`${CONFIG_FILE} is not valid JSON: ${err.message}`);
  }
}

const DEFAULTS = {
  editableRoots: [path.join(REPO_ROOT, 'tests'), path.join(REPO_ROOT, 'src')],
  pageObjectDirs: [path.join(REPO_ROOT, 'src', 'pom')],
  businessFunctionDirs: [path.join(REPO_ROOT, 'src', 'businessFunction')],
  specDirs: [path.join(REPO_ROOT, 'tests')],
};

function detect() {
  const sourceDirs = walkSourceDirs(REPO_ROOT);
  const { pageObjectDirs, businessFunctionDirs, specDirs } = classifyDirs(sourceDirs);
  const editableRoots = deriveEditableRoots([...pageObjectDirs, ...businessFunctionDirs, ...specDirs]);
  return {
    editableRoots: [...editableRoots],
    pageObjectDirs: [...pageObjectDirs],
    businessFunctionDirs: [...businessFunctionDirs],
    specDirs: [...specDirs],
  };
}

let cached = null;

/**
 * { repoRoot, editableRoots, pageObjectDirs, businessFunctionDirs, specDirs,
 *   helperDirs, source } — all absolute paths, all verified to exist.
 *
 * `helperDirs` is the union of page-object and business-function directories:
 * the places worth searching for the implementation behind a call in a test.
 */
function getConventions() {
  if (cached) return cached;

  const config = readConfigFile();
  let resolved;
  let source;

  if (config) {
    resolved = {
      editableRoots: resolveAll(config.editableRoots),
      pageObjectDirs: resolveAll(config.pageObjectDirs),
      businessFunctionDirs: resolveAll(config.businessFunctionDirs),
      specDirs: resolveAll(config.specDirs),
    };
    source = 'config';
  } else {
    resolved = detect();
    source = 'detected';
  }

  // Any category detection/config left empty falls back to the historical
  // default, so a partial config is additive rather than destructive.
  const merged = {};
  for (const key of Object.keys(DEFAULTS)) {
    const present = existingDirs(resolved[key] || []);
    merged[key] = present.length ? present : existingDirs(DEFAULTS[key]);
  }

  // editableRoots must cover every directory the other categories name,
  // otherwise a detected page-object dir outside them could never be edited.
  const editable = new Set(merged.editableRoots);
  for (const dir of [...merged.pageObjectDirs, ...merged.businessFunctionDirs, ...merged.specDirs]) {
    const covered = [...editable].some((root) => dir === root || dir.startsWith(root + path.sep));
    if (!covered) editable.add(dir);
  }

  cached = {
    repoRoot: REPO_ROOT,
    editableRoots: [...editable],
    pageObjectDirs: merged.pageObjectDirs,
    businessFunctionDirs: merged.businessFunctionDirs,
    specDirs: merged.specDirs,
    helperDirs: [...new Set([...merged.pageObjectDirs, ...merged.businessFunctionDirs])],
    source,
  };
  return cached;
}

/** True when `filePath` sits inside one of this project's spec directories. */
function isSpecFile(filePath) {
  const abs = path.resolve(REPO_ROOT, filePath);
  if (SPEC_RE.test(path.basename(abs))) return true;
  return getConventions().specDirs.some((dir) => abs === dir || abs.startsWith(dir + path.sep));
}

/** True when `filePath` sits inside one of this project's page-object directories. */
function isPageObjectFile(filePath) {
  const abs = path.resolve(REPO_ROOT, filePath);
  return getConventions().pageObjectDirs.some((dir) => abs === dir || abs.startsWith(dir + path.sep));
}

/** True when `filePath` sits inside one of this project's business-function directories. */
function isBusinessFunctionFile(filePath) {
  const abs = path.resolve(REPO_ROOT, filePath);
  return getConventions().businessFunctionDirs.some((dir) => abs === dir || abs.startsWith(dir + path.sep));
}

/** Every source file directly inside the page-object/business-function dirs. */
function listHelperFiles() {
  const out = [];
  for (const dir of getConventions().helperDirs) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (SOURCE_EXT.has(path.extname(name))) out.push(path.join(dir, name));
    }
  }
  return out;
}

/** Test seam — detection reads the filesystem, so a test that creates dirs needs this. */
function resetConventions() {
  cached = null;
}

module.exports = {
  getConventions,
  isSpecFile,
  isPageObjectFile,
  isBusinessFunctionFile,
  listHelperFiles,
  resetConventions,
  CONFIG_FILE,
};
