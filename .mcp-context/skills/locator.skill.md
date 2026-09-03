# Locator Skill

> Extracted verbatim from NewPromptFile.md (STEP 4 section)

#### 1. **Hardcoded Locators in Test Files**
```
❌ FORBIDDEN - Hardcoded selector in test
test('TC_AUTH_001 - Login', async ({ page }) => {
  await page.click('button[data-testid="login"]');  // ❌ HARDCODED LOCATOR
  await page.fill('input[placeholder="Email"]', 'user@test.com');  // ❌ HARDCODED LOCATOR
});
```
**Rule**: All locators MUST be defined in Page Objects, NOT in test files.


#### 2. **Duplicate Locator Definitions in Page Objects**
```
❌ FORBIDDEN - Redefining same locator in multiple methods
// In OTTAuthPage.ts
const loginButton = page.getByRole('button', { name: 'Login' });

// In OTTAuthPage.ts again (for same element)
const submitButton = page.getByRole('button', { name: 'Login' });  // ❌ DUPLICATE
```
**Rule**: Define each locator ONCE at the class top. Reuse across all methods.


#### 3. **Reusing Selectors Without PO Abstraction**
```
❌ FORBIDDEN - Selector reuse without abstraction
// In multiple test files
const selector = '[data-testid="login-btn"]';
await page.click(selector);

// In another test file
const selector = '[data-testid="login-btn"]';  // ❌ DUPLICATION
await page.click(selector);
```
**Rule**: Selectors MUST be defined ONCE in Page Objects. Tests MUST NOT contain any selectors.

---


- DO not hardcode the locators within the function.
- Keep all locators at the top of the page object and define them using Playwright-recommended locators such as getByRole(), getByText(), getByLabel(), and getByTestId(). Reuse these locators through functions wherever they are needed instead of redefining them.
- Example:
constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.welcomeText = page.getByText('Welcome', { exact: true });
    this.emailField = page.getByLabel('Email');
    this.submitButton = page.getByTestId('submit-button');
  }
  async clickLogin() {
    await this.loginButton.click();
  }
  async clickWelcome() {
    await this.welcomeText.click();
  }
  async enterEmail(email: string) {
    await this.emailField.fill(email);
  }
  async clickSubmit() {
    await this.submitButton.click();
  }
- If a Playwright-recommended locator is not available or reliable, use: CSS selectors (locator()), XPath selectors
- Use the below-mentioned examples as the least-priority locators.
- Example:
  * async changeQuality(newQuality: string): Promise<void> {
  *   await this.page.click('[data-testid="quality-button"]');
  *   await this.page.click(`[data-testid="quality-${newQuality}"]`);
  *   // Wait for quality change to take effect
  *   await this.page.waitForFunction(
  *     () => getCurrentQuality() === newQuality,
  *     { timeout: 5000 }
  *   );
  * }
- Handle timeouts for video loading, quality changes, etc.
