/**
 * Builds the slice of a captured DOM snapshot worth sending to the model —
 * same problem buildExcerpt (sourceFiles.js) solves for source files, applied
 * to a live page's markup instead: a full page.content() dump can run to
 * hundreds of KB, far past what's worth spending token budget on, and the
 * one region that actually matters (wherever the failing locator's target
 * used to live) is not necessarily near the start of the document.
 *
 * Centers the excerpt on the first `hint` (a distinctive string — a
 * data-testid value, a quoted literal from the error, a class fragment)
 * found verbatim in the HTML, so the window shown is the part of the real
 * page most likely to contain the element the broken locator was trying to
 * reach. Falls back to a plain head slice when no hint matches — still
 * useful (shows real current markup shape), just not targeted.
 */
const { stripHead } = require('./domEvidence');

const DEFAULT_MAX_CHARS = 6000;
const WINDOW_RADIUS = 2500;

/**
 * Generic version of the same windowing buildExcerpt (sourceFiles.js) does
 * for source code, applied to any long text blob — used for both the real
 * DOM (buildDomExcerpt below) and Playwright's accessibility-tree page
 * snapshot, which previously just took `.slice(0, N)` regardless of whether
 * the relevant node fell inside that window at all. A plain head slice on a
 * content-heavy page (this repo's details/playback pages routinely render
 * dozens of cards — see src/pom/OTTDetailsPage.ts) can easily cut off before
 * ever reaching the one element that actually matters.
 */
function buildHintCenteredExcerpt(text, hints = [], { maxChars = DEFAULT_MAX_CHARS, radius = WINDOW_RADIUS } = {}) {
  if (!text) return null;
  for (const hint of hints) {
    if (!hint) continue;
    const idx = text.indexOf(hint);
    if (idx === -1) continue;
    const start = Math.max(0, idx - radius);
    const end = Math.min(text.length, idx + hint.length + radius);
    return { text: text.slice(start, end), truncated: start > 0 || end < text.length, matchedHint: hint };
  }
  return { text: text.slice(0, maxChars), truncated: text.length > maxChars, matchedHint: null };
}

/**
 * `<head>` is removed before the excerpt is cut.
 *
 * The block is introduced to the model as "the only place a CSS
 * class/id/data-testid selector can be confirmed", and it will take strings
 * from anywhere inside it. A real proposal built a content locator out of
 * `<title>DZMM Teleradyo | Watch Now on iWant</title>` — a generic SEO suffix
 * that renders nowhere — and it passed review far enough to be applied. None
 * of head's content (title, meta, link, preload hints) can ever be matched by
 * a locator, so showing it only creates that opportunity. The counterpart
 * check, for a locator that reaches head some other way, is
 * classifyTextEvidence in ./domEvidence.js.
 */
function buildDomExcerpt(domSnapshot, hints = [], opts = {}) {
  if (!domSnapshot?.html) return null;
  return { ...buildHintCenteredExcerpt(stripHead(domSnapshot.html), hints, opts), url: domSnapshot.url };
}

/**
 * Pulls the distinctive strings worth searching the live DOM for: data-testid
 * values and class-selector fragments from every locator declared in the
 * files already being shown to the model, plus quoted literals from the
 * error text (same 6-120 char heuristic addErrorLiteralMatches uses for
 * source files). data-testid values are the most reliable — they render
 * verbatim into the DOM — so they're tried first.
 */
function extractDomHints(files, errorText) {
  const hints = [];
  const seen = new Set();
  const add = (h) => {
    const trimmed = (h || '').trim();
    if (trimmed.length < 3 || seen.has(trimmed)) return;
    seen.add(trimmed);
    hints.push(trimmed);
  };

  for (const file of files) {
    for (const m of file.content.matchAll(/data-testid=\\?["']([^"'\\]+)\\?["']/g)) {
      add(`data-testid="${m[1]}"`);
    }
    // Quote-aware (matches only the SAME quote the value opened with) so a
    // selector like '[data-testid="x"], .y' — single-quoted overall but
    // containing a literal double-quote — doesn't truncate at that inner
    // quote the way a plain [^'"`]+ class would.
    for (const m of file.content.matchAll(/this\.\w+\s*=\s*\{\s*selector:\s*(['"`])((?:\\.|(?!\1).)*)\1/g)) {
      // A single class token out of a (possibly compound/fallback) selector
      // string, e.g. '.season-title, [data-testid*="season"]' -> 'season-title'.
      const classMatch = m[2].match(/\.([a-zA-Z][\w-]*)/);
      if (classMatch) {
        add(`class="${classMatch[1]}"`);
        add(classMatch[1]);
      }
    }
  }

  for (const m of String(errorText || '').matchAll(/['"`]([^'"`\n]{6,120})['"`]/g)) {
    add(m[1]);
  }

  return hints;
}

module.exports = { buildDomExcerpt, buildHintCenteredExcerpt, extractDomHints };
