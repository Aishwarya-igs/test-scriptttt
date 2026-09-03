/**
 * Turns "invent a selector" into "choose from these verified options".
 *
 * Finding the replacement element in a page dump is a search problem, and it
 * is the step that has produced every bad locator this pipeline has shipped:
 * a `<title>` string and a generic `videoPlayer` were both picked out of a
 * DOM excerpt that also contained the right answer. Search is the thing
 * deterministic code is good at and models are not, so it is done here
 * instead, and the model is handed a short ranked list.
 *
 * Three properties make the list trustworthy:
 *
 *   1. Every candidate is REAL. Each is enumerated from the actual failing
 *      page, never generated from a description.
 *   2. Every candidate's selector is VERIFIED UNIQUE before it is offered —
 *      resolved against that same page and required to match exactly one
 *      element. A suggestion that would be ambiguous is dropped rather than
 *      shown.
 *   3. Selectors are written in the priority `.mcp-context/skills/locator.skill.md`
 *      mandates — getByTestId, then getByRole, then getByLabel/Placeholder/
 *      AltText, then getByText, with CSS last — so following the list also
 *      means following the project's standards, rather than the two being in
 *      tension.
 *
 * Ranking reuses the same scorer the post-proposal guard uses
 * (./fingerprint.js), so the model is choosing from options its own verifier
 * will later grade. Generation and verification stop being separate opinions
 * about the same edit.
 */
const { compareFingerprints, describeFingerprint } = require('./fingerprint');

const LAUNCH_TIMEOUT_MS = 15000;
const CONTENT_TIMEOUT_MS = 5000;
// Enough to cover a content-heavy page's interactive surface without turning
// the in-page walk into a cost of its own.
const MAX_ELEMENTS_SCANNED = 4000;
const MAX_CANDIDATES_RETURNED = 5;

function getChromium() {
  try {
    return require('@playwright/test').chromium;
  } catch {
    return null;
  }
}

/**
 * Runs inside the page. Walks the DOM and returns a fingerprint plus a
 * proposed selector for every element that could plausibly be a test target.
 *
 * Self-contained by necessity (it is serialised into the browser), and
 * restricted to plain DOM APIs so it works under setContent with no
 * framework, no scripts and no network.
 */
/* istanbul ignore next — executes in the browser context */
function collectCandidates(maxElements) {
  const INTERACTIVE = new Set(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'VIDEO', 'AUDIO', 'IMG', 'LABEL', 'SUMMARY']);
  const results = [];
  const all = document.body ? document.body.querySelectorAll('*') : [];

  const visibleText = (el) => {
    // Only text this element owns directly or via inline children — not the
    // concatenated contents of an entire section, which would make a <div>
    // wrapping the page look like it "contains" every string on it.
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === 3) text += node.textContent;
      else if (node.nodeType === 1 && !node.querySelector('*')) text += node.textContent;
    }
    return text.replace(/\s+/g, ' ').trim();
  };

  const cssEscape = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&'));
  const quote = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

  for (let i = 0; i < all.length && i < maxElements; i += 1) {
    const el = all[i];
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') continue;

    const testId = el.getAttribute('data-testid');
    const role = el.getAttribute('role');
    const ariaLabel = el.getAttribute('aria-label');
    const alt = el.getAttribute('alt');
    const placeholder = el.getAttribute('placeholder');
    const title = el.getAttribute('title');
    const text = visibleText(el).slice(0, 120);

    // Worth offering only if it carries some identity a locator could use.
    const interesting =
      testId || role || ariaLabel || alt || placeholder || title || el.id || INTERACTIVE.has(tag) || (text && text.length >= 2);
    if (!interesting) continue;

    // An ordered ladder rather than a single guess, because the best-quality
    // selector is not always the unambiguous one. `getByText('LIVE')` matches
    // "LIVE CHAT" too (getByText is substring by default), so on a real page
    // the ideal form is often ambiguous while a slightly lower-priority form
    // — exact text, or the tag/class — resolves uniquely. Offering one form
    // per element silently dropped correct candidates; the caller now walks
    // this list and keeps the first that resolves to exactly one element.
    //
    // Ordering still follows `.mcp-context/skills/locator.skill.md`:
    // testId, then role, then label/placeholder/alt/title, then text, CSS last.
    const options = [];
    const push = (selector, kind) => options.push({ selector, kind });

    if (testId) push(`getByTestId(${quote(testId)})`, 'testId');
    if (role && (ariaLabel || text)) {
      push(`getByRole(${quote(role)}, { name: ${quote(ariaLabel || text)} })`, 'role');
      push(`getByRole(${quote(role)}, { name: ${quote(ariaLabel || text)}, exact: true })`, 'role');
    }
    if (ariaLabel) push(`getByLabel(${quote(ariaLabel)})`, 'label');
    if (placeholder) push(`getByPlaceholder(${quote(placeholder)})`, 'placeholder');
    if (alt) push(`getByAltText(${quote(alt)})`, 'altText');
    if (title) push(`getByTitle(${quote(title)})`, 'title');
    if (text && text.length >= 2) {
      push(`getByText(${quote(text)}, { exact: true })`, 'text');
      push(`getByText(${quote(text)})`, 'text');
    }
    if (el.id) push(`locator(${quote(`#${cssEscape(el.id)}`)})`, 'css');
    const cls = (typeof el.className === 'string' ? el.className.split(/\s+/) : []).filter(Boolean)[0];
    if (cls) push(`locator(${quote(`${tag.toLowerCase()}.${cssEscape(cls)}`)})`, 'css');
    if (!options.length) continue;

    const ancestors = [];
    let node = el.parentElement;
    while (node && ancestors.length < 5) {
      const aid = node.getAttribute('data-testid') || node.id;
      ancestors.push(`${node.tagName.toLowerCase()}${aid ? `#${aid}` : ''}`);
      node = node.parentElement;
    }

    results.push({
      options,
      fingerprint: {
        tag: tag.toLowerCase(),
        role: role || null,
        ariaLabel: ariaLabel || null,
        testId: testId || null,
        id: el.id || null,
        text,
        classes: (typeof el.className === 'string' ? el.className.split(/\s+/) : []).filter(Boolean).slice(0, 8),
        ancestors,
      },
    });
  }
  return results;
}

/** Rebuilds `getByRole('button', { name: 'x' })`-style strings into a real locator, without eval. */
const CALL_RE = /^(\w+)\((.*)\)$/s;
function applyGenerated(page, selector) {
  const m = selector.match(CALL_RE);
  if (!m) throw new Error(`Unparseable generated selector: ${selector}`);
  const [, method, argsRaw] = m;
  // Arguments here are produced by collectCandidates above, never by a model,
  // so the shapes are known: a quoted string, optionally followed by
  // `{ name: '...' }`.
  const first = argsRaw.match(/^'((?:\\.|[^'])*)'/);
  if (!first) throw new Error(`Unparseable arguments: ${argsRaw}`);
  const value = first[1].replace(/\\(['\\])/g, '$1');
  const nameMatch = argsRaw.match(/name:\s*'((?:\\.|[^'])*)'/);
  // `exact` must be honoured, not dropped. Verifying `getByText('LIVE',
  // { exact: true })` as a plain substring match makes it collide with
  // "LIVE CHAT", so the form is discarded as ambiguous and a worse CSS
  // fallback gets offered in its place — the opposite of what the ladder is
  // for.
  const exact = /exact:\s*true/.test(argsRaw);
  const options = {};
  if (nameMatch) options.name = nameMatch[1].replace(/\\(['\\])/g, '$1');
  if (exact) options.exact = true;
  const opts = Object.keys(options).length ? options : undefined;

  switch (method) {
    case 'getByTestId': return page.getByTestId(value);
    case 'getByRole': return page.getByRole(value, opts);
    case 'getByLabel': return page.getByLabel(value, opts);
    case 'getByPlaceholder': return page.getByPlaceholder(value, opts);
    case 'getByAltText': return page.getByAltText(value, opts);
    case 'getByTitle': return page.getByTitle(value, opts);
    case 'getByText': return page.getByText(value, opts);
    case 'locator': return page.locator(value);
    default: throw new Error(`Unsupported generated selector: ${method}`);
  }
}

/**
 * Ranked replacement candidates from `failingHtml` for each target.
 *
 * `targets` is [{ name, fingerprint }] — the element each locator is trying to
 * find, ideally fingerprinted from a page where it worked (see
 * ./fingerprint.js and ./baselineStore.js). Returns
 * [{ name, candidates: [{ selector, description, score, matched, differed }] }]
 * or null if the enumeration could not run at all.
 */
async function rankCandidates(failingHtml, targets) {
  if (!failingHtml || !targets?.length) return null;
  const chromium = getChromium();
  if (!chromium) return null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS });
    const page = await browser.newPage();
    await page.setContent(failingHtml, { waitUntil: 'domcontentloaded', timeout: CONTENT_TIMEOUT_MS });

    const pool = await page.evaluate(collectCandidates, MAX_ELEMENTS_SCANNED);
    if (!pool.length) return null;

    const out = [];
    for (const target of targets) {
      const scored = pool
        .map((entry) => {
          const comparison = compareFingerprints(target.fingerprint, entry.fingerprint);
          return comparison ? { ...entry, ...comparison } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      // Verify before offering: only a selector that resolves to exactly one
      // element on this page is a usable suggestion. Checked in rank order and
      // stopped early, so this costs a handful of resolutions, not hundreds.
      const verified = [];
      for (const entry of scored) {
        if (verified.length >= MAX_CANDIDATES_RETURNED) break;
        if (entry.score < 0.25) break; // below this nothing meaningful is shared

        // First form in the ladder that resolves to exactly one element wins.
        // Ambiguous forms are skipped rather than offered — a candidate the
        // model cannot use unambiguously is worse than one fewer candidate.
        for (const option of entry.options) {
          if (verified.some((v) => v.selector === option.selector)) break;
          let count;
          try {
            count = await applyGenerated(page, option.selector).count();
          } catch {
            continue; // a form the engine itself can't resolve is not offerable
          }
          if (count !== 1) continue;
          verified.push({
            selector: option.selector,
            kind: option.kind,
            score: Number(entry.score.toFixed(2)),
            matched: entry.matched,
            differed: entry.differed,
            description: describeFingerprint(entry.fingerprint),
          });
          break;
        }
      }
      if (verified.length) out.push({ name: target.name, description: target.description, method: target.method || null, kind: 'baseline', candidates: verified });
    }
    return out.length ? out : null;
  } catch {
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

const normWord = (v) => String(v || '').trim().toLowerCase();
const hasWord = (haystack, token) => new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(haystack);

/**
 * How well one element's identity matches a set of meaningful name tokens
 * (e.g. `isLiveIconVisible` -> ['live']) — the fallback used when there is no
 * baseline to compare against (see rankCandidatesByRelevance below).
 *
 * Deliberately tiered rather than a single overlap count: on the real
 * incident this exists for, both "Go Live" (the wrong element — a jump-to-
 * live-edge control) and "Live" (the right one — the status badge) contain
 * the token "live" equally. Rewarding an exact match higher than a token
 * merely appearing inside a longer phrase is what separates them — without
 * it this would rank the wrong element first exactly as often as the right
 * one, which would not be an improvement over the model guessing blind.
 */
function scoreByTokens(fingerprint, tokens) {
  if (!tokens?.length) return 0;
  const text = normWord(fingerprint.text);
  const ariaLabel = normWord(fingerprint.ariaLabel);
  const testId = normWord(fingerprint.testId);
  const classes = (fingerprint.classes || []).map(normWord).join(' ');

  let best = 0;
  for (const token of tokens) {
    if (text && text === token) best = Math.max(best, 1);
    else if (ariaLabel && ariaLabel === token) best = Math.max(best, 0.85);
    else if (text && hasWord(text, token)) best = Math.max(best, 0.6);
    else if (ariaLabel && hasWord(ariaLabel, token)) best = Math.max(best, 0.55);
    else if ((testId && hasWord(testId, token)) || hasWord(classes, token)) best = Math.max(best, 0.35);
  }
  return best;
}

/**
 * Same verified-and-unique guarantee as rankCandidates, but ranked without a
 * baseline: by how well each element's own identity matches meaningful words
 * from the name of the method the failure is inside (e.g. `isLiveIconVisible`
 * -> "live"), instead of by comparison to a recorded known-good element.
 *
 * Exists because rankCandidates requires a passing baseline to compare
 * against, and one is not always available — a test that has never passed
 * since baseline capture was added, or one whose baseline was found to be
 * corrupt and discarded, has none. Without SOME source of real, verified
 * options, the model is left choosing only from the class's already-declared
 * locators, which is how a locator already proven wrong/ambiguous keeps
 * getting reused: it looks like the best of a bad set because nothing better
 * was ever offered.
 *
 * Weaker evidence than a baseline match on purpose — this proves an element
 * plausibly relates to the right SUBJECT, never that it is the exact element
 * the check used to depend on. Callers (see candidatesBlock in ./prompt.js)
 * must present it as a lower-confidence suggestion, not a verified identity
 * match.
 *
 * `targets` is [{ name, description, tokens }]. Returns the same shape as
 * rankCandidates, plus `kind: 'relevance'` on each result so a caller can
 * tell the two apart.
 */
async function rankCandidatesByRelevance(failingHtml, targets) {
  if (!failingHtml || !targets?.length) return null;
  const chromium = getChromium();
  if (!chromium) return null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, timeout: LAUNCH_TIMEOUT_MS });
    const page = await browser.newPage();
    await page.setContent(failingHtml, { waitUntil: 'domcontentloaded', timeout: CONTENT_TIMEOUT_MS });

    const pool = await page.evaluate(collectCandidates, MAX_ELEMENTS_SCANNED);
    if (!pool.length) return null;

    const out = [];
    for (const target of targets) {
      const scored = pool
        .map((entry) => ({ ...entry, score: scoreByTokens(entry.fingerprint, target.tokens) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

      const verified = [];
      for (const entry of scored) {
        if (verified.length >= MAX_CANDIDATES_RETURNED) break;
        for (const option of entry.options) {
          if (verified.some((v) => v.selector === option.selector)) break;
          let count;
          try {
            count = await applyGenerated(page, option.selector).count();
          } catch {
            continue;
          }
          if (count !== 1) continue;
          verified.push({
            selector: option.selector,
            kind: 'relevance',
            score: Number(entry.score.toFixed(2)),
            description: describeFingerprint(entry.fingerprint),
          });
          break;
        }
      }
      if (verified.length) out.push({ name: target.name, description: target.description, method: target.method || null, kind: 'relevance', candidates: verified });
    }
    return out.length ? out : null;
  } catch {
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

module.exports = { rankCandidates, rankCandidatesByRelevance, collectCandidates };
