# Playwright Skill

> Extracted verbatim from NewPromptFile.md (STEP 4 section)

#### 1. **Inline Playwright in Test Files**
```
❌ FORBIDDEN - Playwright usage in test
test('TC_PLAY_001 - Play Content', async ({ page }) => {
  await page.goto('/playback');  // ❌ INLINE NAVIGATION
  await page.waitForSelector('[data-testid="video"]');  // ❌ INLINE WAIT
  const quality = await page.getAttribute('[data-quality]', 'value');  // ❌ INLINE DOM QUERY
});
```
**Rule**: Test files MUST only call Business Functions. No Playwright direct usage allowed.


#### 2. **Playwright Imports in Test Files (Except test/expect)**
```
❌ FORBIDDEN - Playwright imports in tests
import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';  // ❌ FORBIDDEN
import { locator } from '@playwright/test';  // ❌ FORBIDDEN
```
**Rule**: Test files MUST only import `{ test, expect }` from Playwright. Nothing else.

#### 3. **Playwright Imports in Business Functions**
```
❌ FORBIDDEN - Playwright in BF
import { Page } from '@playwright/test';  // ❌ NOT ALLOWED

export async function loginToOTT(page: Page, input: LoginInput) {
  await page.click('[selector]');  // ❌ INLINE PLAYWRIGHT
}
```
**Rule**: Business Functions MUST NOT import or use Playwright directly. Only compose Page Objects.

