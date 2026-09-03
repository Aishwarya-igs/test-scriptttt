/**
 * Checks a proposed locator's text against the page that was actually
 * captured at failure, and tells the difference between text a user could
 * see and text that only exists in the document's metadata.
 *
 * This exists because of a real fix that was proposed, applied, and passed
 * its verification rerun while being wrong. Asked to repair
 * `isLiveIconVisible()`, the model produced:
 *
 *     this.page.locator('text=/Watch Now on iWant/i').first()
 *
 * The string was not invented — it appears in the captured DOM exactly once,
 * at character 6187, inside `<head>`:
 *
 *     <title>DZMM Teleradyo | Watch Now on iWant</title>
 *
 * That is the site's generic SEO title suffix, present on every content page
 * and rendered nowhere. Playwright's text engine does not match `<head>`
 * (verified: count() === 0), so the locator could not resolve there — and
 * even where it did resolve, it says nothing about whether the content is
 * live, which is the entire point of the check it was placed in.
 *
 * Two lessons, both encoded here:
 *   1. "The model found this string in the real DOM" is not grounding. WHERE
 *      in the DOM decides whether it means anything.
 *   2. Text that appears only in `<head>` is a provable mistake, not a
 *      judgement call — so it is rejected outright rather than warned about.
 *      Text absent from the snapshot entirely is only suspicious (the element
 *      may render later, or after a state change), so that is a warning.
 */

const HEAD_RE = /<head\b[^>]*>([\s\S]*?)<\/head>/i;
const BODY_RE = /<body\b[^>]*>([\s\S]*)$/i;
// Elements whose text content is never rendered to the user.
const NON_RENDERED_RE = /<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi;

const toText = (html) =>
  String(html || '')
    .replace(NON_RENDERED_RE, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** { headText, bodyText } for a captured snapshot, or null when there's nothing to read. */
function splitDocument(domSnapshot) {
  const html = domSnapshot?.html || domSnapshot?.dom;
  if (!html || typeof html !== 'string') return null;
  const head = html.match(HEAD_RE);
  const body = html.match(BODY_RE);
  // A snapshot with no <body> at all is too odd to reason about; treating its
  // whole content as body text would be a guess, and a wrong guess here
  // rejects a legitimate fix.
  if (!body) return null;
  return { headText: toText(head ? head[1] : ''), bodyText: toText(body[1]) };
}

// Playwright text-matching syntax that can appear inside an otherwise plain
// selector string: `text=Foo`, `text="Foo"`, `text=/re/i`, `:has-text("Foo")`,
// `:text-is('Foo')`. These are how a CSS-looking selector can actually be
// matching on human-visible copy.
const TEXT_IN_SELECTOR = [
  /:(?:has-)?text(?:-is)?\(\s*(['"])((?:\\.|(?!\1).)*)\1\s*\)/g,
  /:(?:has-)?text(?:-is)?\(\s*\/((?:\\.|[^/])+)\/([a-z]*)\s*\)/g,
  /\btext=\s*\/((?:\\.|[^/])+)\/([a-z]*)/g,
  /\btext=\s*(['"])((?:\\.|(?!\1).)*)\1/g,
  /\btext=\s*([^'"/\],)]+)/g,
];

/**
 * The human-readable strings a locator depends on — the parts that must
 * correspond to something on the page, as opposed to structural CSS.
 * [{ type: 'string'|'regex', value|source, flags }]
 */
function extractTextProbes(descriptor) {
  const probes = [];
  const addString = (value) => {
    const trimmed = String(value || '').trim();
    // Very short fragments match everything and prove nothing.
    if (trimmed.length >= 3) probes.push({ type: 'string', value: trimmed });
  };
  const addRegex = (source, flags) => {
    if (source) probes.push({ type: 'regex', source, flags: (flags || '').replace(/[^gimsuy]/g, '') });
  };

  for (const step of descriptor?.steps || []) {
    // getByText / getByLabel / getByPlaceholder / getByAltText / getByTitle,
    // and the accessible name of a getByRole.
    const isTextKind = ['text', 'label', 'placeholder', 'altText', 'title'].includes(step.kind);
    if (isTextKind && step.value) {
      if (step.value.type === 'string') addString(step.value.value);
      else if (step.value.type === 'regex') addRegex(step.value.source, step.value.flags);
    }
    const name = step.options?.name || step.options?.hasText;
    if (name) {
      if (name.type === 'string') addString(name.value);
      else if (name.type === 'regex') addRegex(name.source, name.flags);
    }
    // A CSS selector can still be matching on copy via Playwright's text engine.
    if (step.kind === 'css' && step.value?.type === 'string') {
      const raw = step.value.value;
      for (const pattern of TEXT_IN_SELECTOR) {
        pattern.lastIndex = 0;
        for (const m of raw.matchAll(pattern)) {
          if (m[1] && m[1].length === 1 && (m[1] === '"' || m[1] === "'")) addString(m[2]);
          else if (pattern.source.includes('\\/')) addRegex(m[1], m[2]);
          else addString(m[1]);
        }
      }
    }
  }
  return probes;
}

const matches = (probe, text) => {
  if (!text) return false;
  if (probe.type === 'regex') {
    try {
      return new RegExp(probe.source, probe.flags.replace('g', '')).test(text);
    } catch {
      return false; // unparseable regex proves nothing either way
    }
  }
  return text.toLowerCase().includes(probe.value.toLowerCase());
};

/**
 * 'body'      — the text is in rendered content; the locator is grounded.
 * 'head-only' — the text exists ONLY in <head> (title/meta). Provably wrong.
 * 'absent'    — nowhere in the captured page. Suspicious, not conclusive.
 * 'unknown'   — no usable snapshot, or the locator has no text component.
 */
function classifyTextEvidence(descriptor, domSnapshot) {
  const doc = splitDocument(domSnapshot);
  if (!doc) return { verdict: 'unknown', probes: [] };
  const probes = extractTextProbes(descriptor);
  if (!probes.length) return { verdict: 'unknown', probes: [] };

  const inBody = probes.filter((p) => matches(p, doc.bodyText));
  if (inBody.length) return { verdict: 'body', probes, matched: inBody };

  const inHead = probes.filter((p) => matches(p, doc.headText));
  if (inHead.length) {
    return { verdict: 'head-only', probes, matched: inHead, describe: describeProbe(inHead[0]) };
  }
  return { verdict: 'absent', probes, describe: describeProbe(probes[0]) };
}

const describeProbe = (probe) => (probe.type === 'regex' ? `/${probe.source}/${probe.flags}` : `"${probe.value}"`);

/** Removes <head> so an excerpt can only ever show rendered markup. */
function stripHead(html) {
  return String(html || '').replace(HEAD_RE, '<head><!-- omitted: metadata, not rendered content --></head>');
}

module.exports = { classifyTextEvidence, extractTextProbes, splitDocument, stripHead, describeProbe };
