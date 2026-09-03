/**
 * The "dynamic runtime access" piece: instead of asking a model to guess a
 * replacement selector purely from text (the ARIA tree, or even the DOM
 * excerpt in domExcerpt.js) and trusting it, actually launch a browser,
 * navigate to the page the test was failing on, and check whether the
 * proposed selector — and, for comparison, the old one — resolve to
 * anything right now. This turns "the model thinks this selector is right"
 * into "this selector was confirmed against the live app a moment ago."
 *
 * Deliberately best-effort in every dimension, matching this codebase's
 * existing posture toward every other optional enrichment (RCA's provider
 * fallback chain, spot-fix's consensus escalation): no browser binary
 * installed, no network path to the app (this suite has a documented
 * history of CDN/VPN blocks), the app requiring an authenticated session
 * this unauthenticated probe doesn't have — any of these just mean "no
 * extra corroboration available," never a thrown error that blocks a
 * proposal from being returned.
 */
const LAUNCH_TIMEOUT_MS = 15000;
const NAV_TIMEOUT_MS = 10000;

/**
 * Rebuilds a locator from the steps ./locatorSyntax.js parsed out of the
 * source — never by evaluating source text. A fixed switch over a known set
 * of kinds means the worst a malformed proposal can do is fail to build a
 * locator.
 *
 * This is what lets the probe check a `getByRole('button', { name: 'Login' })`
 * locator at all. Before, probing went straight to `page.locator(string)`,
 * which silently only ever worked for CSS — every locator written the way the
 * project's own standards require went unverified.
 */
const reviveRegex = (value) =>
  value && typeof value === 'object' && value.__regex ? new RegExp(value.__regex.source, value.__regex.flags) : value;

function reviveOptions(options) {
  if (!options) return undefined;
  const out = {};
  for (const [key, value] of Object.entries(options)) out[key] = reviveRegex(value);
  return out;
}

function buildLocator(page, steps) {
  let current = page;
  for (const step of steps) {
    const value = step.regex ? new RegExp(step.regex.source, step.regex.flags) : step.value;
    const options = reviveOptions(step.options);
    switch (step.kind) {
      case 'css': current = current.locator(value); break;
      case 'role': current = current.getByRole(value, options); break;
      case 'text': current = current.getByText(value, options); break;
      case 'label': current = current.getByLabel(value, options); break;
      case 'placeholder': current = current.getByPlaceholder(value, options); break;
      case 'altText': current = current.getByAltText(value, options); break;
      case 'title': current = current.getByTitle(value, options); break;
      case 'testId': current = current.getByTestId(value); break;
      case 'frame': current = current.frameLocator(value); break;
      case 'filter': current = current.filter(options); break;
      case 'first': current = current.first(); break;
      case 'last': current = current.last(); break;
      case 'nth': current = current.nth(step.index); break;
      default:
        throw new Error(`Unsupported locator step "${step.kind}"`);
    }
  }
  if (current === page) throw new Error('Empty locator specification');
  return current;
}

/** Accepts a plain CSS string (as before) or a { steps, label } spec. */
function normalizeTarget(target) {
  if (typeof target === 'string') return { label: target, steps: [{ kind: 'css', value: target }] };
  if (target?.steps?.length) return { label: target.label || JSON.stringify(target.steps), steps: target.steps };
  return null;
}

function getChromium() {
  try {
    // Reuses the same Playwright install this whole repo already depends on
    // (@playwright/test) rather than adding a separate dependency.
    return require('@playwright/test').chromium;
  } catch {
    return null;
  }
}

/**
 * Checks each target in `selectors` against the live page at `url`. A target
 * is either a CSS string or a { steps, label } spec from
 * ./locatorSyntax.js#toProbeSpec.
 *
 * Returns { landedUrl, requestedUrl, results: [{selector, count, error}], checkedAt }
 * on success, or null if a probe could not be attempted/completed at all
 * (missing browser, bad url, navigation failure, etc.) — callers must treat
 * null exactly like "not checked," not like a negative result.
 */
async function probeSelectors(url, selectors) {
  if (!url || !selectors?.length) return null;
  const chromium = getChromium();
  if (!chromium) return null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });

    const results = [];
    for (const target of selectors) {
      const spec = normalizeTarget(target);
      if (!spec) continue;
      try {
        const count = await buildLocator(page, spec.steps).count();
        results.push({ selector: spec.label, count, error: null });
      } catch (err) {
        // A locator Playwright's own engine can't even parse (e.g. an
        // invalid pseudo-class a model hallucinated) — still worth
        // reporting as a distinct outcome from "not checked".
        results.push({ selector: spec.label, count: null, error: err.message });
      }
    }
    return { landedUrl: page.url(), requestedUrl: url, results, checkedAt: new Date().toISOString() };
  } catch {
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

// buildLocator is shared with ./fingerprint.js deliberately: resolving a
// locator against a saved page and against the live page must use identical
// semantics, or the two checks could disagree about the same selector.
module.exports = { probeSelectors, buildLocatorSteps: buildLocator };
