/** Shared prompt construction + response parsing for every AI-backed RCA provider. */
const { stripAnsi } = require('./ansi');
const { normalizeCategory } = require('./categories');
// Reused from spot-fix rather than duplicated: RCA's category call (code vs
// environment) was being made on strictly less evidence than the spot-fix
// prompt one click later gets — see buildLocatorIndex/buildDomExcerpt's own
// comments for why an accessibility-only snapshot can't show a stale CSS
// selector at all. Giving RCA the same locator catalog + real-DOM excerpt
// (kept far smaller than spot-fix's own budget — RCA only needs enough to
// judge code-vs-environment, not enough to author an edit) fixes that gap
// at the source instead of only downstream in spot-fix.
const { buildLocatorIndex } = require('../spotfix/locatorIndex');
const { buildDomExcerpt, buildHintCenteredExcerpt, extractDomHints } = require('../spotfix/domExcerpt');

const RCA_DOM_MAX_CHARS = 2000;
const RCA_ARIA_MAX_CHARS = 4000;

/**
 * Was a plain `.slice(0, 4000)` regardless of whether the relevant node fell
 * inside that window — on a content-heavy page (dozens of cards on this
 * repo's details/playback pages) the element actually implicated by the
 * failure can sit well past the cutoff while the model reads about
 * everything before it instead. Centers on the same hints used for the real
 * DOM excerpt when one is found in the tree; otherwise falls back to the
 * previous head-slice behavior exactly as before.
 */
function ariaSnapshotBlock(pageSnapshot, hints) {
  if (!pageSnapshot) return '';
  const excerpt = buildHintCenteredExcerpt(pageSnapshot, hints, { maxChars: RCA_ARIA_MAX_CHARS });
  if (!excerpt) return '';
  return `Page snapshot at failure time (accessibility tree)${excerpt.matchedHint ? ` (excerpt centered on a match for "${excerpt.matchedHint}")` : ''}:\n${excerpt.text}\n`;
}

function locatorCatalogBlock(files) {
  const parts = (files || [])
    .map((f) => {
      const idx = buildLocatorIndex(f.content);
      if (!idx.locators.length) return '';
      return `${f.relative}:\n${idx.locators.map((l) => `  ${l.name} → ${l.selector}`).join('\n')}`;
    })
    .filter(Boolean);
  if (!parts.length) return '';
  return `\nLocators declared in the relevant source file(s) (ground truth for whether a selector is stale — do not guess this from the error text alone):\n${parts.join('\n')}\n`;
}

function domSnapshotBlock(domSnapshot, hints) {
  if (!domSnapshot) return '';
  const excerpt = buildDomExcerpt(domSnapshot, hints, { maxChars: RCA_DOM_MAX_CHARS });
  if (!excerpt) return '';
  return `\nLive DOM at failure — real markup, not the accessibility tree above (the accessibility tree cannot show a CSS class or data-testid, which is how this repo's locators are written):\n${excerpt.text}\n`;
}

/**
 * Cross-run memory for this exact test case (see testCaseIdentity.js) — has
 * it failed before, and what was concluded then? Without this, a test that
 * has failed the same way for the last five runs gets re-diagnosed from
 * scratch every time, with no way to say "this again" or notice the
 * category keeps flip-flopping across occurrences of the same failure.
 */
function priorHistoryBlock(priorHistory) {
  if (!priorHistory?.length) return '';
  const lines = priorHistory
    .map((h) => {
      const parts = [`${h.createdAt}: status=${h.status}`];
      if (h.rca) parts.push(`RCA said "${h.rca.category}" — ${h.rca.summary}`);
      if (h.spotFix) {
        parts.push(
          `spot fix proposed (confidence: ${h.spotFix.confidence})${h.spotFix.applied ? `, applied${h.spotFix.verification ? `, verification: ${h.spotFix.verification}` : ''}${h.spotFix.reverted ? ', later reverted' : ''}` : ', not applied'}`
        );
      }
      return `- ${parts.join(' | ')}`;
    })
    .join('\n');
  return `\nPRIOR HISTORY FOR THIS TEST CASE (most recent first — same ticket id, different runs)\n${lines}\nIf the same category or root cause keeps recurring across these, say so explicitly rather than re-deriving it from scratch as if this is the first occurrence. If a spot fix was already applied and its verification failed, do not suggest the same kind of change again without new evidence.\n`;
}

/**
 * What a timed-out test was still waiting on, recovered from the trace (see
 * ./traceActions.js).
 *
 * Without this a bare "Test timeout of Nms exceeded" gives a model nothing
 * but the page snapshot to read tea leaves from, which is exactly why
 * applyTimeoutCategoryGuard used to force such failures to "unknown". The
 * hanging call names the locator, which is both the actual diagnosis and
 * something checkable against the DOM snapshot above.
 */
function hangingActionBlock(hangingAction) {
  if (!hangingAction?.selector) return '';
  return `
WHAT THE TEST WAS WAITING FOR WHEN IT TIMED OUT (recovered from the Playwright trace — this is the call that never completed)
${hangingAction.title || hangingAction.method}
${hangingAction.describedParams}${hangingAction.inheritedTestTimeout ? '\nThis call had no timeout of its own, so it consumed the entire test budget — everything after it never ran.' : ''}

This is the specific thing that hung. Diagnose THIS, not the timeout in general. Check the selector above against the page snapshot and DOM: if the element genuinely is not on the page, decide whether that is because the locator no longer matches what the app renders (code) or because the app never reached the state that would produce it (environment).
`;
}

function buildPrompt(
  test,
  errorContext,
  { files = [], domSnapshot = null, priorHistory = [], hangingAction = null } = {}
) {
  const errorText = stripAnsi(test.error?.message);
  const hints = files.length || domSnapshot ? extractDomHints(files, errorText) : [];
  return `You are helping a QA engineer triage a failed Playwright test. Be concise (3-5 sentences for root cause, 2-3 for the fix). Do not invent details not present below.

Test: ${test.title}
File: ${test.file}:${test.line}

Error:
${errorText || '(no error message captured)'}

${errorContext?.errorDetails ? `Error details:\n${errorContext.errorDetails}\n` : ''}
${ariaSnapshotBlock(errorContext?.pageSnapshot, hints)}
${locatorCatalogBlock(files)}
${domSnapshotBlock(domSnapshot, hints)}
${hangingActionBlock(hangingAction)}
${priorHistoryBlock(priorHistory)}
Classify the failure into exactly one CATEGORY:
- code: the test or page-object source is wrong (stale selector, wrong expected text, missing/insufficient wait). Fixable by editing this repo's source.
- environment: run config, test data, credentials, or connectivity is wrong, OR the application itself failed to render. Nothing in the repo to change. In particular, if the page snapshot shows navigation and footer but an empty content area (a "main" node with no children), the app rendered nothing — every failed assertion below that is a symptom, and no test edit can fix it. Classify that as environment, never as code.
- infrastructure: blocked outside the app (CDN/WAF/bot-detection "Access Denied", browser launch failure). Note that an "Access Denied" or challenge page means the app never loaded, so downstream selector timeouts are symptoms, not the cause.
- unknown: not enough signal to tell.

Respond in exactly this format:
SUMMARY: <one-line root cause>
CATEGORY: <code|environment|infrastructure|unknown>
ROOT_CAUSE: <detailed explanation>
SUGGESTED_FIX: <concrete suggestion, with a code snippet if relevant>`;
}

function parseModelResponse(raw) {
  const summary = raw.match(/SUMMARY:\s*(.+)/i)?.[1]?.trim();
  const category = raw.match(/CATEGORY:\s*(.+)/i)?.[1]?.trim();
  // ROOT_CAUSE may be followed by either remaining section, in either order.
  const rootCause = raw.match(/ROOT_CAUSE:\s*([\s\S]*?)(?=SUGGESTED_FIX:|CATEGORY:|$)/i)?.[1]?.trim();
  const suggestedFix = raw.match(/SUGGESTED_FIX:\s*([\s\S]*?)(?=CATEGORY:|$)/i)?.[1]?.trim();
  if (!summary && !rootCause && !suggestedFix) {
    // Model didn't follow the format — surface the raw text rather than losing it.
    return { summary: raw.slice(0, 200), category: 'unknown', rootCause: raw, suggestedFix: '' };
  }
  return {
    summary: summary || '(no summary)',
    category: normalizeCategory(category),
    rootCause: rootCause || '',
    suggestedFix: suggestedFix || '',
  };
}

module.exports = { buildPrompt, parseModelResponse };
