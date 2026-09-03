# Assertions Skill

> Extracted verbatim from NewPromptFile.md (STEP 4 section)

🔷 LAYER 1 - TEST FILES (tests/ott-app/*.spec.ts):
- Each test case becomes a test() block
- File organization: Group test cases by feature area
  * tests/ott-app/authentication.spec.ts (TC_AUTH_*)
  * tests/ott-app/playback.spec.ts (TC_PLAY_*)
  * tests/ott-app/discovery.spec.ts (TC_DISC_*)
  * tests/ott-app/watchlist.spec.ts (TC_WATCH_*)
  * tests/ott-app/subscription.spec.ts (TC_SUB_*)
- ONLY import: { test, expect }
- Test function named after test case: test('TC_AUTH_001 - Login with Premium User', async ({ page }) => {})
- Call Business Functions in order specified in test specification
- Assert using BF return values ONLY
- NO Playwright direct usage
- NO PAGE OBJECTS or waits
- NO DOM queries
- Example:
  * test('TC_AUTH_001 - Login with Premium User', async ({ page }) => {
  *   const testData = testCaseData['tc-auth-001-premium-user'];
  *   const result = await loginToOTT(page, { email: testData.email, password: testData.password });
  *   expect(result.isLoggedIn).toBe(true);
  *   expect(result.userPlan).toBe('premium');
  * });
 
