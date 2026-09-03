const fs = require('fs');

/**
 * Loads the real-DOM artifact captured by src/fixtures/test-hooks.ts on
 * failure (name: 'dom-snapshot', a JSON blob of { url, html }) — the
 * counterpart to loadErrorContext's accessibility-tree snapshot, but with
 * actual markup: classes, ids, data-testid attributes. None of that exists
 * in an accessibility tree, so this is the only source of truth this
 * pipeline has for a CSS-selector locator that stopped matching.
 *
 * Returns null (never throws) if the attachment is missing or unreadable —
 * older recorded runs, predating this capture, simply have none.
 */
function loadDomSnapshot(test) {
  const attachment = (test.attachments || []).find((a) => a.name === 'dom-snapshot' && a.path);
  if (!attachment) return null;
  try {
    const raw = fs.readFileSync(attachment.path, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.html !== 'string') return null;
    return { file: attachment.path, url: typeof parsed.url === 'string' ? parsed.url : null, html: parsed.html };
  } catch {
    return null;
  }
}

module.exports = { loadDomSnapshot };
