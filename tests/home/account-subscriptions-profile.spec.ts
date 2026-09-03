import { test, expect } from '../../src/fixtures/test-hooks';
import { manageWatchlistItem } from '../../src/businessFunction/ott-watchlist-bfs';
import { loginWithTVProvider, verifyAccountAndSubscriptionDetails } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Profile and account details', () => {
  test('@High @D IW3-T3658: Verify the user is able see the Account & subscriptions details in My Space/Profile sections', async ({ page }) => {
    const data = testCaseData['tc-auth-015-account-subscriptions'];
    const loginResult = await loginWithTVProvider(page, {
      providerName: data.providerName,
      mode: data.mode,
    });
    const result = await verifyAccountAndSubscriptionDetails(page, {
      mode: data.mode,
      providerName: data.providerName,
      expectedSectionName: data.expectedSectionName,
      expectedSubscriptionText: data.expectedSubscriptionText,
    });
    expect(loginResult.isLoggedIn).toBe(true);
    expect(result.isProfileSectionVisible).toBe(true);
    expect(result.isAccountAndSubscriptionDetailsVisible).toBe(true);
    expect(result.profileSectionText).toContain(data.expectedSectionName);
    expect(result.accountDetailsText).toContain(data.expectedSubscriptionText);
  });


  test('@High @D IW3-T3659: Verify the user is able to add/remove any contents to the My watchlist page using Add/Remove from watchlist', async ({ page }) => {
    const data = testCaseData['tc-auth-016-watchlist-management'];
    const loginResult = await loginWithTVProvider(page, {
      providerName: data.providerName,
      mode: data.mode,
    });
    const result = await manageWatchlistItem(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      

    });
    expect(loginResult.isLoggedIn).toBe(true);
    expect(result.isAddedToWatchlist).toBe(true);
    expect(result.addToastText).toContain('Added to watchlist');
    expect(result.isRemovedFromWatchlist).toBe(true);
    expect(result.removeToastText).toContain('Removed from watchlist');
  });
});
