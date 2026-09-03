# Page Object Skill

> Extracted verbatim from NewPromptFile.md (STEP 4 section)

🔷 LAYER 3 - PAGE OBJECTS (src/pom/OTTAppPage.ts):
- Page Objects organized by feature area:
  * OTTAuthPage.ts - Login, logout, registration
  * OTTPlaybackPage.ts - Playback controls, quality, subtitles
  * OTTSearchPage.ts - Search, filter, browse
  * OTTWatchlistPage.ts - Watchlist, continue watching
  * OTTSubscriptionPage.ts - Subscription, billing
  * OTTProfilePage.ts - Profile, settings, parental controls
- Own all selectors, waits, retries
- Implement semantic methods required by test case BFs
- Use Playwright directly
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
 
