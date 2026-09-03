import { test, expect } from '../../src/fixtures/test-hooks';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyLiveContentWatchlistAbsence, addContentToWatchlistFromSearchPageStep, removeContentFromWatchlistFromSearchPageStep, addPremiumContentToWatchlist, removePremiumContentFromWatchlist, verifyFreeTagInWatchlist, addFreeContentToWatchlist, removeFreeContentFromWatchlist, verifyWatchlistContentMetadataAndThumbnails, playContentFromWatchlist, verifyWatchlistTaggedContentFlow, resolveFreeLiveContentFromCollectionGraphQL } from '../../src/businessFunction/ott-watchlist-bfs';

test.describe('Watchlist management', () => {
  test('@Medium  IW3-T2046: Verify content can be played directly from my watchlist', async ({ page }) => {
    test.setTimeout(240000);
    const data = testCaseData['tc-watch-010-play-content-from-watchlist'];
    const result = await playContentFromWatchlist(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.contentOpened).toBe(true);
    expect(result.playerVisible).toBe(true);
    expect(result.playerTitleVisible).toBe(true);
    expect(result.playerTitleMatches).toBe(true);
  });
  
  test('@Medium @mWeb IW3-T2047: Verify Add to Watchlist option is not displayed for Live content', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-auth-018-live-content-watchlist-absence'];
    const loginResult = await loginToOTT(page, {
      mode: data.mode,
    });
    expect(loginResult.isLoggedIn).toBe(true);
    const freeLive = await resolveFreeLiveContentFromCollectionGraphQL(page);
    expect(freeLive).toBeDefined();
    expect(freeLive?.title).toBeTruthy();
    const result = await verifyLiveContentWatchlistAbsence(page, {
      liveContentName: freeLive?.title,
    });
    expect(result.isLiveChannelsTrayVisible).toBe(true);
    expect(result.isLiveContentVisible).toBe(true);
    expect(result.isAddToWatchlistButtonVisible).toBe(false);
  });
  test('@Medium  IW3-T2048: Verify that Movie/Show content in my watchlist page loads correctly with correct thumbnails and metadata', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-watch-009-watchlist-thumbnail-metadata'];
    const result = await verifyWatchlistContentMetadataAndThumbnails(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.titleVisibleInWatchlist).toBe(true);
    expect(result.metadataVisibleInWatchlist).toBe(true);
    expect(result.contentMatches).toBe(true);
  });
  test('@Medium IW3-T2049: Verify that "Free" tag is displayed for free content in my watchlist', async ({ page }) => {
  test.setTimeout(90000)
    const data = testCaseData['tc-watch-007-free-tag-visible-in-watchlist'];
    const result = await verifyFreeTagInWatchlist(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(true);
    expect(result.isFreeTagVisible).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });
  test('@Medium IW3-T2050: Verify that user is able to add free content into my watchlist', async ({ page }) => {
    const data = testCaseData['tc-watch-008-add-free-content-to-watchlist'];
    const result = await addFreeContentToWatchlist(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(true);
    expect(result.contentMatchesFirstWatchlistItem).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });
  test('@Medium  IW3-T2051: Verify that user is able to remove free content from my watchlist', async ({ page }) => {
    const data = testCaseData['tc-auth-022-remove-free-watchlist'];
    const result = await removeFreeContentFromWatchlist(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
    });
    expect(result.addedToWatchlist).toBe(true);
    expect(result.removedFromWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(false);
    expect(result.removeToastText.toLowerCase()).toContain('removed');
  });
  test('@Medium  IW3-T2052: Verify that user is able to add premium content to my watchlist', async ({ page }) => {
    const data = testCaseData['tc-watch-005-add-premium-content-to-watchlist'];
    const result = await addPremiumContentToWatchlist(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });
  test('@Medium  IW3-T2053: Verify that user is able to remove premium content from my watchlist', async ({ page }) => {
    const data = testCaseData['tc-watch-006-remove-premium-content-from-watchlist'];
    const result = await removePremiumContentFromWatchlist(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.removedFromWatchlist).toBe(true);
    expect(result.isVisibleInMyWatchlist).toBe(false);
    expect(result.removeToastText.toLowerCase()).toContain('removed');
  });
  test('@Medium  IW3-T2054: Verify that user is able to add tagged content to my watchlist and tags are displayed correctly', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-watch-011-watchlist-tagged-content'];
    const result = await verifyWatchlistTaggedContentFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      labels: data.labels,
    });
    expect(result.loggedIn).toBe(true);
    expect(result.labelsProcessed).toBe(data.labels.length);
    result.validationResults.forEach((item) => {
      expect(item.contentTitle).not.toBe('');
      expect(item.addedToWatchlist).toBe(true);
      expect(item.visibleInWatchlist).toBe(true);
      expect(item.watchlistTagged).toBe(true);
    });
  });
  test('@Medium  IW3-T2056: Verify that user is able to add content to my watchlist from search page', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-watch-004-add-content-from-search-page'];
    const loginResult = await loginToOTT(page, {
      mode: data.mode,
    });
    expect(loginResult.isLoggedIn).toBe(true);
    const result = await addContentToWatchlistFromSearchPageStep(page, {
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.toastText.toLowerCase()).toContain('added');
  });
  test('@Medium  IW3-T2057: Verify that user is able to remove content from my watchlist from search page', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-watch-005-remove-content-from-search-page'];
    const result = await removeContentFromWatchlistFromSearchPageStep(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.addedToWatchlist).toBe(true);
    expect(result.removedFromWatchlist).toBe(true);
    expect(result.removeToastText.toLowerCase()).toContain('removed');
  });
});