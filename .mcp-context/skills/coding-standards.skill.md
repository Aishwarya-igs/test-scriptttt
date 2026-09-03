# Coding Standards Skill

> Extracted verbatim from NewPromptFile.md (STEP 4 section)

#### 1. **Hardcoded Business Functions Logic in Test Files**
```
❌ FORBIDDEN - Logic that should be in BF
test('TC_WATCH_001 - Add to Watchlist', async ({ page }) => {
  const watchlistButton = await page.$('[data-testid="watchlist-btn"]');
  await watchlistButton.click();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="watchlist-btn"]').classList.contains('active'),
    { timeout: 5000 }
  );
  const isAdded = await page.evaluate(() => {
    return document.querySelector('[data-watchlist-count]').textContent === '1';
  });
});
```
**Rule**: All interaction logic MUST be in Business Functions, which compose Page Objects.


#### 2. **Magic Strings and Hardcoded Values in Test Files**
```
❌ FORBIDDEN - Magic values in test
test('TC_PLAY_002 - Change Quality', async ({ page }) => {
  const result = await changeQualityBF(page, '1080p');  // ❌ HARDCODED VALUE
  await page.waitForTimeout(3000);  // ❌ MAGIC TIMEOUT
  expect(result).toBe(true);
});
```
**Rule**: All test data MUST come from src/data/*.json. All timeouts MUST be in Page Objects.


#### 3. **DOM Queries and Evaluations in Tests**
```
❌ FORBIDDEN - DOM manipulation in tests
test('TC_SUB_001 - View Plan', async ({ page }) => {
  const planName = await page.evaluate(() => {
    return document.querySelector('[data-plan]').textContent;  // ❌ INLINE EVAL
  });
});
```
**Rule**: All DOM queries and evaluations MUST be in Page Objects with semantic methods.

#### 4. **Waits and Timeouts in Tests**
```
❌ FORBIDDEN - Waits in test files
test('TC_PLAY_003 - Seek Video', async ({ page }) => {
  await page.waitForSelector('[data-video]');  // ❌ WAIT IN TEST
  await page.waitForTimeout(2000);  // ❌ TIMEOUT IN TEST
  await page.waitForFunction(() => isVideoReady());  // ❌ WAIT FUNCTION IN TEST
});
```
**Rule**: All waits and timeouts MUST be in Page Objects. Tests MUST NOT have any waits.

### ✅ ENFORCEMENT CHECKLIST (Before Code Generation)

- [ ] ALL locators will be defined in Page Objects at class top
- [ ] ALL locators will use Playwright-recommended methods (getByRole, getByLabel, getByTestId, getByText)
- [ ] NO hardcoded selectors in test files
- [ ] NO inline Playwright in test files
- [ ] NO Playwright imports in test files (except test/expect)
- [ ] NO Playwright imports in Business Functions
- [ ] ALL test logic will be in Business Functions
- [ ] ALL selectors will be in Page Objects
- [ ] ALL assertions will use Business Function return values
- [ ] ALL test data will come from src/data/*.json or .env where applicable
- [ ] ALL manual execution and automation must use .env values for credentials and runtime data
- [ ] NO hardcoded credentials or runtime values in tests, business functions, or JSON files
- [ ] NO duplicate locator definitions
- [ ] NO magic strings or hardcoded values in tests
- [ ] NO waits, timeouts, or DOM queries in tests

---
