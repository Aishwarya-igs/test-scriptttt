/**
 * What an element actually IS, recorded from a page where the locator worked,
 * so a replacement can be matched against it instead of guessed at.
 *
 * Two design choices worth stating, because both were forced by earlier
 * failures:
 *
 * 1. Saved HTML is loaded into a real headless page via setContent, and the
 *    locator is resolved by Playwright itself. Parsing HTML here and
 *    reimplementing selector semantics would mean a second, subtly different
 *    matcher — and the whole value of this check is that it agrees with what
 *    the test will actually do at runtime. It reuses the browser liveProbe.js
 *    already depends on, so there is no new dependency.
 *
 * 2. A fingerprint deliberately excludes the selector. The selector is the
 *    thing that broke; recording it would just re-record the problem. What is
 *    stored is identity that survives a restyle — role, accessible name,
 *    visible text, tag, test id, and the shape of the ancestor chain. CSS
 *    classes churn constantly; those rarely all change at once, which is what
 *    makes similarity scoring meaningful rather than superstitious.
 *
 * setContent loads markup with no scripts executing and no network, so this
 * inspects static structure only. That is exactly what is wanted: whether the
 * element that used to be there still exists in some recognisable form.
 */
const LAUNCH_TIMEOUT_MS = 15000;
const RESOLVE_TIMEOUT_MS = 5000;

function getChromium() {
  try {
    return require('@playwright/test').chromium;
  } catch {
    return null;
  }
}

// Runs in the page. Kept to plain DOM APIs so it works under setContent with
// no framework present.
/* istanbul ignore next — executes in the browser context */
function describeElement(el) {
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const ancestors = [];
  let node = el.parentElement;
  while (node && ancestors.length < 5) {
    const id = node.getAttribute('data-testid') || node.id;
    ancestors.push(`${node.tagName.toLowerCase()}${id ? `#${id}` : ''}`);
    node = node.parentElement;
  }
  return {
    tag: el.tagName.toLowerCase(),
    role: el.getAttribute('role') || null,
    ariaLabel: el.getAttribute('aria-label') || null,
    testId: el.getAttribute('data-testid') || null,
    id: el.id || null,
    text,
    classes: (el.className && typeof el.className === 'string' ? el.className.split(/\s+/) : []).filter(Boolean).slice(0, 8),
    ancestors,
  };
}

function buildLocator(page, steps) {
  const { buildLocatorSteps } = require('./liveProbe');
  return buildLocatorSteps(page, steps);
}

/**
 * Resolves each { key, steps } spec against `html` and returns
 * { key -> { count, element|null } }. Returns null when nothing could be
 * attempted at all (no browser, bad markup) — callers must treat that as "not
 * checked", never as a negative result.
 */
async function fingerprintAgainstHtml(html, specs) {
  if (!html || !specs?.length) return null;
  const chromium = getChromium();
  if (!chromium) return null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: RESOLVE_TIMEOUT_MS });

    const out = {};
    for (const spec of specs) {
      try {
        // Count the RAW locator, before narrowing — narrowing to .first()
        // first would cap count at 1 no matter how ambiguous the selector
        // actually is, silently hiding the exact failure mode this exists to
        // catch (see verifyRelatedLocators in ./index.js, which reports this
        // count directly to the model). `element` still describes whichever
        // one .first() would actually pick at runtime, since that's what a
        // caller comparing identity needs — only the count changes.
        const rawLocator = buildLocator(page, spec.steps);
        const count = await rawLocator.count();
        out[spec.key] = {
          count,
          element: count > 0 ? await rawLocator.first().evaluate(describeElement) : null,
        };
      } catch (err) {
        out[spec.key] = { count: null, element: null, error: err.message };
      }
    }
    return out;
  } catch {
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

const norm = (v) => String(v || '').trim().toLowerCase();

/**
 * How strongly two element fingerprints describe the same thing: 0..1, plus
 * the signals that agreed and disagreed.
 *
 * Weighted by how stable each signal is under a redesign. A test id or an
 * accessible name surviving is strong evidence of the same element; matching
 * CSS classes is weak evidence, since those are the first thing a restyle
 * changes and the last thing worth trusting.
 */
const SIGNALS = [
  { key: 'testId', weight: 3, get: (e) => norm(e.testId) },
  { key: 'ariaLabel', weight: 3, get: (e) => norm(e.ariaLabel) },
  { key: 'text', weight: 3, get: (e) => norm(e.text) },
  { key: 'role', weight: 2, get: (e) => norm(e.role) },
  { key: 'id', weight: 2, get: (e) => norm(e.id) },
  { key: 'tag', weight: 1, get: (e) => norm(e.tag) },
];

function compareFingerprints(before, after) {
  if (!before || !after) return null;

  let total = 0;
  let scored = 0;
  const matched = [];
  const differed = [];

  for (const signal of SIGNALS) {
    const a = signal.get(before);
    const b = signal.get(after);
    if (!a && !b) continue; // neither side has this signal — it says nothing
    total += signal.weight;
    if (a && b && a === b) {
      scored += signal.weight;
      matched.push(signal.key);
    } else {
      differed.push(signal.key);
    }
  }

  // Ancestor chain: partial credit, since a wrapper being added or removed is
  // routine and should not read as "different element".
  const beforeAncestors = new Set((before.ancestors || []).map(norm));
  const afterAncestors = (after.ancestors || []).map(norm);
  if (beforeAncestors.size && afterAncestors.length) {
    const overlap = afterAncestors.filter((a) => beforeAncestors.has(a)).length;
    const ratio = overlap / Math.max(beforeAncestors.size, afterAncestors.length);
    total += 2;
    scored += 2 * ratio;
    (ratio >= 0.5 ? matched : differed).push('ancestors');
  }

  return total ? { score: scored / total, matched, differed } : null;
}

/**
 * For each edit: what the locator it replaces matched on the last passing
 * page, what its replacement matches on the failing page, and how alike those
 * two elements are.
 *
 * A high score means the replacement found the same element the test used to
 * work against, even though the selector had to change — the case this whole
 * mechanism exists for. A low score means it found something else, which is
 * how `videoPlayer` differs from `liveTag` in a way no amount of reading the
 * failing page alone can reveal.
 *
 * Returns null whenever the comparison could not be made (no baseline, no
 * browser, locator unresolvable in either page). Null is "not checked" and
 * must never be reported as a negative result.
 */
async function assessBaselineMatch(pairs, { baselineHtml, failingHtml }) {
  if (!baselineHtml || !failingHtml || !pairs.length) return null;

  const oldSpecs = pairs.filter((p) => p.oldSpec).map((p) => ({ key: `old:${p.key}`, steps: p.oldSpec.steps }));
  const newSpecs = pairs.filter((p) => p.newSpec).map((p) => ({ key: `new:${p.key}`, steps: p.newSpec.steps }));
  if (!oldSpecs.length || !newSpecs.length) return null;

  const [before, after] = await Promise.all([
    fingerprintAgainstHtml(baselineHtml, oldSpecs),
    fingerprintAgainstHtml(failingHtml, newSpecs),
  ]);
  if (!before || !after) return null;

  const results = [];
  for (const pair of pairs) {
    const wasElement = before[`old:${pair.key}`]?.element;
    const nowElement = after[`new:${pair.key}`]?.element;
    if (!wasElement || !nowElement) continue;
    const comparison = compareFingerprints(wasElement, nowElement);
    if (comparison) results.push({ ...pair, was: wasElement, now: nowElement, ...comparison });
  }
  return results.length ? results : null;
}

/** Short human description of a fingerprinted element, for prompts and warnings. */
function describeFingerprint(element) {
  if (!element) return 'nothing';
  const bits = [`<${element.tag}>`];
  if (element.role) bits.push(`role=${element.role}`);
  if (element.testId) bits.push(`data-testid="${element.testId}"`);
  if (element.ariaLabel) bits.push(`aria-label="${element.ariaLabel}"`);
  if (element.text) bits.push(`text "${element.text.slice(0, 60)}"`);
  return bits.join(' ');
}

module.exports = {
  fingerprintAgainstHtml,
  compareFingerprints,
  assessBaselineMatch,
  describeFingerprint,
  describeElement,
};
