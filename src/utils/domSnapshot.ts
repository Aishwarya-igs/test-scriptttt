/**
 * Sanitizes raw page HTML captured on test failure before it's written to
 * disk as an RCA/Spot-Fix artifact.
 *
 * Playwright's built-in error-context.md is an *accessibility* snapshot
 * (role + accessible name only) — it cannot show a CSS class, an id, or a
 * data-testid attribute, because none of those are accessibility concepts.
 * This repo's Page Object locators are almost entirely CSS
 * (`[data-testid="show-card"]`, `.season-title`, `[class*="episode"]` — see
 * src/pom/OTTDetailsPage.ts), so when one of those stops matching, the
 * accessibility tree alone gives a diagnosing model no way to know what the
 * markup actually looks like now. This captures the real DOM instead.
 *
 * Stripped of script/style/comments and collapsed whitespace so the saved
 * file stays a reasonable size — none of that is useful for locator
 * debugging, and inline scripts in particular can be the bulk of a page's
 * weight.
 */
export function sanitizeDomSnapshot(html: string, maxLength = 300_000): string {
  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();

  if (out.length > maxLength) out = `${out.slice(0, maxLength)}\n<!-- truncated at ${maxLength} chars -->`;
  return out;
}
