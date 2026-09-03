import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyEndToEndLaunchLoginSearchPlaybackFlow } from '../../src/businessFunction/ott-end-to-end-bfs';
import testData from '../../src/data/ott-test-cases.json';

test.describe('End To End', () => {
  test(' end-to-end launch, login, navigation, search and playback of a content', async ({ page }) => {
    test.setTimeout(180000);
    const data = testData['tc-sub-033-end-to-end-launch-login-search-playback'] as Record<string, any>;
    const result = await verifyEndToEndLaunchLoginSearchPlaybackFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect.soft(result.trendingMoviesRailVisible).toBeTruthy();
    expect.soft(result.trendingShowsRailVisible).toBeTruthy();
    expect.soft(result.myWatchlistRailVisible).toBeTruthy();
    expect.soft(result.continueWatchingRailVisible).toBe(true)
    expect.soft(result.topStreamedRailVisible).toBeTruthy();
    expect.soft(result.searchBarPlaceholderVisible).toBeTruthy();
    expect.soft(result.signOutOptionVisible).toBeTruthy();
    expect.soft(result.searchResultsVisible).toBeTruthy();
    expect.soft(result.detailsVisible).toBeTruthy();
    expect.soft(result.genreVisible).toBeDefined();
    expect.soft(result.ratingVisible).toBeDefined();
    expect.soft(result.qualityVisible).toBeDefined();
    expect.soft(result.contentMetadataVisible).toBeTruthy();
    expect.soft(result.contentDescriptionVisible).toBeDefined();
    expect.soft(result.addToWatchlistVisible).toBeDefined();
    expect.soft(result.playerVisible).toBeTruthy();
    expect.soft(result.playbackControlsVisible).toBeTruthy();
    expect.soft(result.playerTitleVisible).toBeTruthy();
    expect.soft(result.seekBarVisible).toBeTruthy();
    expect.soft(result.backButtonVisible).toBeTruthy();
    expect.soft(result.pausePlayButtonVisible).toBeTruthy();
    expect.soft(result.rewindButtonVisible).toBeTruthy();
    expect.soft(result.forwardButtonVisible).toBeTruthy();
    expect.soft(result.playbackDurationVisible).toBeTruthy();
    expect.soft(result.detailsVisibleAfterNav).toBeTruthy();
  });
});
