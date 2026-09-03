/**
 * Strips ANSI colour codes from Playwright's captured error text.
 *
 * Playwright colourises assertion failures for the terminal, and those escape
 * sequences survive into `error.message`/`error.stack` verbatim. Rendered as
 * HTML they show up as literal noise — "[2mexpect([22m[31mreceived[39m" —
 * which buries the expected/received values the reader actually needs.
 *
 * Mirrors dashboard/lib/rca/ansi.js, which does the same before any error text
 * reaches a heuristic regex or an AI prompt. Applied at render time rather
 * than at ingestion so runs already recorded on disk display correctly too.
 */
export function stripAnsi(text: string): string {
  if (!text) return text;
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}
