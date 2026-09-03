const fs = require('fs');
const path = require('path');

/**
 * Playwright registers error-context.md as a real attachment (name:
 * 'error-context', contentType: text/markdown) alongside screenshot/trace.
 * Fall back to same-directory-as-any-attachment convention in case an older
 * Playwright version or a differently-configured reporter doesn't attach it
 * by name.
 */
function findErrorContextFile(test) {
  const byName = (test.attachments || []).find((a) => a.name === 'error-context' && a.path);
  if (byName) return byName.path;

  const withPath = (test.attachments || []).find((a) => a.path);
  if (!withPath) return null;
  const dir = path.dirname(withPath.path);
  const candidate = path.join(dir, 'error-context.md');
  return fs.existsSync(candidate) ? candidate : null;
}

/** Splits error-context.md into its named sections (## headers Playwright always emits). */
function parseErrorContext(raw) {
  const sections = {};
  const parts = raw.split(/^# /m).slice(1);
  for (const part of parts) {
    const newlineIndex = part.indexOf('\n');
    const heading = part.slice(0, newlineIndex).trim().toLowerCase();
    const body = part.slice(newlineIndex + 1).trim();
    sections[heading] = body;
  }
  return {
    errorDetails: sections['error details'] || '',
    pageSnapshot: sections['page snapshot'] || '',
    testSource: sections['test source'] || '',
  };
}

/** Best-effort: returns null (never throws) if no error-context.md exists for this test. */
function loadErrorContext(test) {
  const file = findErrorContextFile(test);
  if (!file) return null;
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return { file, ...parseErrorContext(raw) };
  } catch {
    return null;
  }
}

module.exports = { loadErrorContext };
