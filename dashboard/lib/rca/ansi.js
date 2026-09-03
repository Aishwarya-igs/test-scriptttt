/**
 * Playwright's captured error.message/stack always carry raw ANSI color
 * escape codes (e.g. from its own pretty-printed `expect` diffs), even when
 * there's no terminal to render them — the JS reporter API hands over the
 * same string a color terminal would receive. error-context.md is already
 * clean (Playwright strips it there), but nothing else is, so every
 * consumer of raw error text — heuristic regexes and AI prompts alike —
 * needs this first or literal patterns silently stop matching.
 */
function stripAnsi(text) {
  if (!text) return text;
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

module.exports = { stripAnsi };
