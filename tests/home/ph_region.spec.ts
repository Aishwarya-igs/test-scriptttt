import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyGuestWatchlistNavigationFromFreeAsset, verifyGuestWatchlistHoverNavigationFromFreeAsset } from '../../src/businessFunction/ott-watchlist-bfs';
import { verifyGuestPHCarouselTabTrayLoad, verifyGuestSearchResultsWithoutLogin } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyGuestSubscribeNavigationFromFreeAsset, verifyPremiumCrownIconOnSearchResults } from '../../src/businessFunction/ott-subscription-bfs';
import { verifyGuestSearchNavigationFromFreeAsset, verifyGuestShareFunctionalityFromFreeAsset } from '../../src/businessFunction/ott-details-bfs';
import { playFreeAsset } from '../../src/businessFunction/ott-playback-bfs';

test.describe('PH region guest watchlist navigation', () => {
  test('@High IW3-T1872: Verify the navigation on tapping Watchlist icon for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-017-ph-region-guest-watchlist'];
    const result = await verifyGuestWatchlistNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
    });

    expect(result.isLoginScreenVisible).toBe(true);
    expect(result.isEmailFieldVisible).toBe(true);
    expect(result.isPasswordFieldVisible).toBe(true);
    expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
  });

  test('@Medium @mWeb IW3-T1873: Verify the details screen share functionality for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-020-ph-region-guest-share'];
    const result = await verifyGuestShareFunctionalityFromFreeAsset(page, {
      expectedShareMessage: data.expectedShareMessage,
    });

    expect(result.isContentDetailsPageVisible).toBe(true);
    expect(result.isContentMetadataVisible).toBe(true);
    expect(result.isContentTitleImageVisible).toBe(true);
    expect(result.isContentGenreVisible).toBe(true);
    expect(result.isContentCastVisible).toBe(true);
    expect(result.isShareIconVisible).toBe(true);
    expect(result.shareMessageText.toLowerCase()).toContain((data.expectedShareMessage ?? 'share link copied').toLowerCase());
  });

test('@Medium @D IW3-T1875: Verify the navigation on "Subscribe" CTA for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-019-ph-region-guest-subscribe'];
    const result = await verifyGuestSubscribeNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
    });

      expect(result.isLoginScreenVisible).toBe(true);
      expect(result.isEmailFieldVisible).toBe(true);
      expect(result.isPasswordFieldVisible).toBe(true);
      expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
  });

  test('@Medium @mWeb IW3-T1876: Verify the search functionality for the PH region guest user', async ({ page }) => {
    const data = testCaseData['tc-auth-018-ph-region-guest-search'];
    const result = await verifyGuestSearchNavigationFromFreeAsset(page, {
      searchTerm: data.searchTerm,
      expectedTitle: data.expectedTitle,
    });

    expect(result.isSearchInputPopulated).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.titleMatchesSearchTerm).toBe(true);
    
  });

  
  test('@Medium IW3-T1889: Verify carousel content, sub-navigation tabs, and trays load properly for a guest user from the Philippines', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-auth-022-ph-region-guest-carousel-tab-tray'];
    const result = await verifyGuestPHCarouselTabTrayLoad(page, { mode: data?.mode });
    expect(result.homeRailVisible).toBe(true);
    expect(result.homePageScrolledToEnd).toBe(true);
    expect(result.moviesRailVisible).toBe(true);
    expect(result.moviesPageScrolledToEnd).toBe(true);
    expect(result.showsRailVisible).toBe(true);
    expect(result.showsPageScrolledToEnd).toBe(true);
  });
test('@Medium IW3-T1891: Verify login page will be displayed when user taps the Add to Watchlist icon via mouse hover on any tray content from PH region', async ({ page }) => {
    const data = testCaseData['tc-auth-021-ph-region-guest-watchlist-hover'];
    const result = await verifyGuestWatchlistHoverNavigationFromFreeAsset(page, {
      expectedHeading: data.expectedHeading,
      graphqlQueryName: data.graphqlQueryName,
 
    });

    expect(result.isLoginScreenVisible).toBe(true);
    expect(result.isEmailFieldVisible).toBe(true);
    expect(result.isPasswordFieldVisible).toBe(true);
    expect(result.headingText.toLowerCase()).toContain((data.expectedHeading ?? 'Welcome to iWant').toLowerCase());
  });

  test('@High IW3-T2034: Verify that crown icon is displayed on the content thumbnail for premium contents', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-sub-004-premium-crown-icon'];
    const result = await verifyPremiumCrownIconOnSearchResults(page, {
      graphqlQueryName: data.graphqlQueryName,
      expectedMonetizationType: data.expectedMonetizationType,
    });

    expect(result.searchResultsVisible).toBe(true);
    expect(result.premiumCrownIconVisible).toBe(true);
    expect(result.firstSearchResultMonetizationType.toLowerCase()).toContain('paid');
  });

  test('@High IW3-T1871: Verify the content starts playing on tapping the Play button for a free asset', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-play-001-free-asset-playback'];
        const result = await playFreeAsset(page, { mode: data.mode });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isPlayableContentDetected).toBe(true);
        expect(result.playAttempted).toBe(true);
        expect(result.playbackStarted).toBe(true);
    });

  
});
