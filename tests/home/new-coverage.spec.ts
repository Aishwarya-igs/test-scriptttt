import { test, expect } from '../../src/fixtures/test-hooks'
import { loginToOTT, enterCreateAccountCredentials } from '../../src/businessFunction/ott-auth-bfs';
import { playEpisodeFromDetailsPage } from '../../src/businessFunction/ott-details-bfs';
import { removeFromContinueWatching } from '../../src/businessFunction/ott-continue-watching-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

// New coverage: wires up three business functions that already existed in
// this framework (ott-auth-bfs / ott-details-bfs / ott-continue-watching-bfs)
// but had no spec calling them yet, so they never ran. Composed the same way
// as the existing skip-intro/continue-watching specs: log in with
// loginToOTT first, then call the target business function on the same page.
test.describe('New coverage', () => {
  test('@High NEW-1 - Play episode from show details page', async ({ page }) => {
    test.setTimeout(120000);
    // getPlaybackEpisodeTitleText() in OTTDetailsPage.ts has a locator
    // hardcoded to "The Blood Sisters" episode text, so that's the only
    // title this flow can verify against — matches tc-disc-002's own intent.
    const data = testCaseData['tc-disc-002-episode-playback'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);

    const result = await playEpisodeFromDetailsPage(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });

    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isEpisodeListVisible).toBe(true);
    expect(result.isPlayerVisible).toBe(true);
    expect(result.playbackContentTitle.length).toBeGreaterThan(0);
  });

  test('@High NEW-2 - Remove an item from the Continue Watching tray', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-disc-003-remove-continue-watching'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);

    const result = await removeFromContinueWatching(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      contentTitle: data.contentTitle,
    });

    expect(result.isContinueWatchingTrayVisible).toBe(true);
    expect(result.wasItemPresentBeforeRemoval).toBe(true);
    expect(result.isItemPresentAfterRemoval).toBe(false);
  });

  test('@Medium NEW-3 - Enter email and password on the Create Account screen', async ({ page }) => {
    const data = testCaseData['tc-auth-011-create-account-credentials'];

    const result = await enterCreateAccountCredentials(page, {
      email: data.email,
      password: data.password,
    });

    expect(result.isEmailFieldVisible).toBe(true);
    expect(result.isPasswordFieldVisible).toBe(true);
    expect(result.emailFieldValue).toBe(data.email);
    expect(result.passwordFieldValue).toBe(data.password);
  });
});
