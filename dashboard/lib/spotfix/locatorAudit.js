/**
 * Resolves every locator the project declares against every page this
 * dashboard has captured, to find the ones that are already dead.
 *
 * Motivated by a real discovery: a method whose locator matches nothing can
 * run for a long time without anyone noticing, because the method that uses
 * it swallows its own errors (returning false/'' — see
 * ./swallowedFailures.js) and reports the dead locator as a legitimate
 * negative result. That is a locator silently not testing anything, which is
 * worse than a red test.
 *
 * IMPORTANT CORRECTION: an earlier version of this file included a static
 * lint claiming Playwright's `text=` engine does not honour `\b` word
 * boundaries in a regex. That claim was checked directly against a real
 * headless browser and disproved — `text=/\bLIVE\b/i` correctly excludes
 * "OLIVE"/"LIVELY" and matches "Live"/"Go Live"/"LIVE CHAT", identically to a
 * native JS RegExp. The lint was removed rather than left in place, because a
 * static "this is always broken" claim that turns out to be wrong is more
 * dangerous than having no claim at all — it actively steers a fix away from
 * a locator that may be correct. Anything this file asserts as page-
 * independently broken is limited, deliberately, to syntax shapes verified
 * against Playwright's actual parser (see the remaining STATIC_LINTS below),
 * never to claims about regex feature support that were not re-checked here.
 *
 * The correctness trap this has to avoid: a locator belongs to one page. A
 * login button checked against a player page matches nothing, and reporting
 * that as "dead" would bury the real findings under false positives. So a
 * locator is only ever called dead when it matched nothing on EVERY captured
 * page, and pages where nothing relevant was captured produce 'uncovered'
 * rather than a verdict. Absence of evidence is reported as absence of
 * evidence.
 */
const fs = require('fs');
const path = require('path');
const { getConventions } = require('../projectConventions');
const { parseLocatorDeclarations, toProbeSpec, describeLocator } = require('./locatorSyntax');
const { BASELINE_DIR } = require('./baselineStore');
const { ARTIFACTS_DIR, REPO_ROOT } = require('../paths');

const LAUNCH_TIMEOUT_MS = 20000;
const CONTENT_TIMEOUT_MS = 8000;

function getChromium() {
  try {
    return require('@playwright/test').chromium;
  } catch {
    return null;
  }
}

/**
 * Bugs decidable from the selector text alone, with no page needed. These are
 * the strongest findings in the report: a page-based check can only say "not
 * on this page", while these are wrong everywhere.
 */
const ENGINE_PREFIX = /^\s*(?:text|xpath|role|id|data-testid|css)\s*=/;

/**
 * Splits a selector on commas that are genuinely top-level — not inside
 * quotes, brackets or parentheses.
 *
 * A naive `.split(',')` reported `role=button[name="Frontier, a Verizon
 * Company"]` and `xpath=ancestor::div[contains(@class, "episode-info")][1]`
 * as malformed. Both parse perfectly; their commas just live inside a quoted
 * attribute value and an xpath function call.
 */
function splitTopLevel(selector) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const ch = selector[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '[' || ch === '(') depth += 1;
    else if (ch === ']' || ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts;
}

const STATIC_LINTS = [
  {
    id: 'mixed-engine-in-css-list',
    // `.loader, text=Foo` is parsed wholly as CSS — `text=` is a Playwright
    // engine prefix, not CSS — so it throws rather than falling back.
    // Verified against Playwright's own parser.
    test: (selector) => {
      const segments = splitTopLevel(selector);
      return segments.length > 1 && segments.slice(1).some((s) => ENGINE_PREFIX.test(s));
    },
    detail:
      'Mixes a Playwright engine prefix (text=, xpath=) into a comma-separated CSS list. The whole string is parsed as CSS, so this throws rather than falling back — Playwright reports: Unexpected token "=" while parsing css selector. Split the alternatives into separate locators, or chain them with >>.',
  },
  {
    id: 'text-engine-swallows-comma-list',
    // Subtler and more dangerous than the parse error above, because nothing
    // throws. Once a selector starts with `text=`, EVERYTHING after it is the
    // literal string to find — commas included. `text=Edit Profile,
    // button:has-text("Edit Profile")` does not try two alternatives; it
    // looks for one element whose text is literally
    // `Edit Profile, button:has-text("Edit Profile")`. Confirmed against
    // Playwright: parses fine, matches nothing, forever.
    test: (selector) => {
      const segments = splitTopLevel(selector);
      return segments.length > 1 && /^\s*text\s*=/.test(segments[0]);
    },
    detail:
      'Starts with text=, so the comma and everything after it are treated as part of the literal text to match, not as alternative selectors. This parses without error and silently matches nothing. Use separate locators, or getByText() with a single string.',
  },
  {
    id: 'empty-selector',
    test: (selector) => !selector || !selector.trim(),
    detail: 'The selector is empty, so it can never match.',
  },
];

/** Every locator declared across the project's page objects and business functions. */
function collectDeclaredLocators() {
  const out = [];
  for (const dir of getConventions().helperDirs) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!/\.(ts|js|tsx|jsx)$/.test(name)) continue;
      const filePath = path.join(dir, name);
      let content;
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        continue;
      }
      for (const declaration of parseLocatorDeclarations(content)) {
        out.push({
          file: path.relative(REPO_ROOT, filePath).split(path.sep).join('/'),
          name: declaration.name,
          line: declaration.line,
          rendered: describeLocator(declaration),
          spec: toProbeSpec(declaration),
          probeable: declaration.probeable,
        });
      }
    }
  }
  return out;
}

const readSnapshot = (file, label) => {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return typeof parsed.html === 'string' ? { label, url: parsed.url || null, html: parsed.html } : null;
  } catch {
    return null;
  }
};

/**
 * Every captured page available to check against: stored passing baselines
 * first (they represent a working app), then per-run failure snapshots.
 */
function collectSnapshots({ limit = 12 } = {}) {
  const snapshots = [];

  try {
    for (const name of fs.readdirSync(BASELINE_DIR)) {
      if (!name.endsWith('.json')) continue;
      const snap = readSnapshot(path.join(BASELINE_DIR, name), `baseline:${name.replace(/\.json$/, '')}`);
      if (snap) snapshots.push(snap);
    }
  } catch {
    /* no baselines recorded yet */
  }

  const walk = (dir, depth = 0) => {
    if (depth > 3 || snapshots.length >= limit) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (snapshots.length >= limit) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name === 'dom-snapshot.json') {
        const snap = readSnapshot(full, `failure:${path.basename(path.dirname(full)).slice(0, 12)}`);
        if (snap) snapshots.push(snap);
      }
    }
  };
  walk(ARTIFACTS_DIR);

  // De-duplicate identical captures — the same page recorded by several runs
  // adds cost without adding coverage.
  const seen = new Set();
  return snapshots.filter((s) => {
    const key = `${s.html.length}:${s.html.slice(0, 200)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildLocator(page, steps) {
  const { buildLocatorSteps } = require('./liveProbe');
  return buildLocatorSteps(page, steps);
}

/**
 * { summary, snapshotsUsed, findings } — findings sorted worst first.
 *
 * Verdicts:
 *   invalid   — broken regardless of page (static lint or unparseable)
 *   dead      — checked against at least one page, matched on none
 *   ambiguous — never resolved to exactly one element, only to many
 *   uncovered — could not be checked (dynamic value, or no page to check on)
 *   healthy   — resolved to exactly one element on at least one page
 */
async function auditLocators({ onProgress } = {}) {
  const locators = collectDeclaredLocators();
  const snapshots = collectSnapshots();
  const findings = [];

  // Static lints first: they need no browser and are page-independent, so
  // they still produce a useful report when nothing has been captured yet.
  const remaining = [];
  for (const locator of locators) {
    // Lint the selector the locator ACTUALLY resolves to, not the rendered
    // declaration. Two reasons: the rendering contains commas between object
    // properties, which made `{ text: 'Home', selector: 'nav >> text=Home' }`
    // look like a malformed CSS list; and a PageElement with a testId/role/
    // text set never uses its `selector` field at all (see the resolver
    // precedence in ./locatorSyntax.js), so a malformed one there is unused
    // code rather than a live failure.
    const cssValues = (locator.spec?.steps || []).filter((s) => s.kind === 'css' && s.value).map((s) => s.value);
    const lint = STATIC_LINTS.map((l) => ({ lint: l, hit: cssValues.find((v) => l.test(v)) }))
      .find((x) => x.hit !== undefined)?.lint;
    if (lint) {
      findings.push({ ...locator, verdict: 'invalid', reason: lint.id, detail: lint.detail, matchedOn: [] });
    } else if (!locator.spec) {
      findings.push({
        ...locator,
        verdict: 'uncovered',
        reason: 'dynamic-value',
        detail: 'Built from a variable or interpolated template, so it has no fixed value to resolve.',
        matchedOn: [],
      });
    } else {
      remaining.push(locator);
    }
  }

  const chromium = getChromium();
  if (!chromium || !snapshots.length || !remaining.length) {
    for (const locator of remaining) {
      findings.push({
        ...locator,
        verdict: 'uncovered',
        reason: snapshots.length ? 'no-browser' : 'no-captured-pages',
        detail: snapshots.length
          ? 'No browser available to resolve this against a captured page.'
          : 'No captured page was available to check against. Baselines are recorded whenever a test passes.',
        matchedOn: [],
      });
    }
    return finalize(findings, snapshots);
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS });
    // counts[locatorIndex] = [{ label, count }] across every page.
    const counts = remaining.map(() => []);

    for (const [snapIndex, snapshot] of snapshots.entries()) {
      const page = await browser.newPage();
      try {
        await page.setContent(snapshot.html, { waitUntil: 'domcontentloaded', timeout: CONTENT_TIMEOUT_MS });
        for (const [i, locator] of remaining.entries()) {
          try {
            counts[i].push({ label: snapshot.label, count: await buildLocator(page, locator.spec.steps).count() });
          } catch (err) {
            counts[i].push({ label: snapshot.label, count: null, error: err.message });
          }
        }
      } catch {
        /* this page could not be loaded — it simply contributes no coverage */
      } finally {
        await page.close().catch(() => {});
      }
      onProgress?.({ page: snapIndex + 1, of: snapshots.length });
    }

    for (const [i, locator] of remaining.entries()) {
      const results = counts[i];
      const checked = results.filter((r) => r.count !== null);
      const unique = checked.filter((r) => r.count === 1);
      const many = checked.filter((r) => r.count > 1);
      const errored = results.find((r) => r.count === null);

      if (!checked.length) {
        findings.push({
          ...locator,
          verdict: errored ? 'invalid' : 'uncovered',
          reason: errored ? 'unresolvable' : 'not-checked',
          detail: errored
            ? `Playwright could not resolve this selector at all: ${errored.error}`
            : 'Could not be checked against any captured page.',
          matchedOn: [],
        });
      } else if (unique.length) {
        findings.push({
          ...locator,
          verdict: 'healthy',
          reason: 'resolves',
          detail: `Resolves to exactly one element on ${unique.length} of ${checked.length} captured page(s).`,
          matchedOn: unique.map((r) => r.label),
        });
      } else if (many.length) {
        findings.push({
          ...locator,
          verdict: 'ambiguous',
          reason: 'multiple-matches',
          detail: `Never resolves to a single element — matched ${many[0].count} elements on ${many[0].label}. Whichever .first() picks is positional, so it can silently change.`,
          matchedOn: many.map((r) => r.label),
        });
      } else {
        findings.push({
          ...locator,
          verdict: 'dead',
          reason: 'no-match',
          detail: `Matched nothing on any of the ${checked.length} captured page(s). If none of those is the page this locator belongs to, it may simply be uncovered rather than broken.`,
          matchedOn: [],
        });
      }
    }
  } catch {
    /* fall through to whatever was gathered */
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  return finalize(findings, snapshots);
}

const ORDER = { invalid: 0, dead: 1, ambiguous: 2, uncovered: 3, healthy: 4 };

/**
 * Downgrades 'dead' to 'uncovered' for any file where nothing resolved at all.
 *
 * A page object's locators only resolve against that page object's page. With
 * a handful of captured pages, an entire class whose page was never visited
 * comes back 100% dead — which is a statement about capture coverage, not
 * about the locators. Reporting those as broken buries the genuine findings:
 * the first run of this reported 114 "dead" locators, most of them simply
 * belonging to screens no snapshot covered.
 *
 * The signal used is whether ANY locator in the file resolved on ANY page. If
 * one did, that page was captured and a sibling matching nothing is worth
 * looking at. If none did, there is no evidence either way.
 */
function applyCoverageHeuristic(findings) {
  const healthyByFile = new Map();
  for (const f of findings) {
    if (f.verdict === 'healthy' || f.verdict === 'ambiguous') healthyByFile.set(f.file, true);
  }
  return findings.map((f) => {
    if (f.verdict !== 'dead' || healthyByFile.get(f.file)) return f;
    return {
      ...f,
      verdict: 'uncovered',
      reason: 'page-not-captured',
      detail: `Nothing in ${f.file} resolved on any captured page, so that screen has almost certainly never been captured — this is missing coverage, not evidence the locator is broken.`,
    };
  });
}

function finalize(rawFindings, snapshots) {
  const findings = applyCoverageHeuristic(rawFindings);
  findings.sort((a, b) => ORDER[a.verdict] - ORDER[b.verdict] || a.file.localeCompare(b.file) || a.line - b.line);
  const summary = findings.reduce(
    (acc, f) => ({ ...acc, [f.verdict]: (acc[f.verdict] || 0) + 1 }),
    { total: findings.length }
  );
  return { summary, snapshotsUsed: snapshots.map((s) => ({ label: s.label, url: s.url })), findings };
}

module.exports = { auditLocators, collectDeclaredLocators, collectSnapshots };
