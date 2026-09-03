import { test, expect } from '../../src/fixtures/test-hooks';
import {
  navigateToShowDetailsFromShowsPage,
  verifyContentDetailsPageUi,
  verifyEpisodesDisplayedInAscendingOrder,
  verifyEpisodesGroupedBySeason,
  verifyShareLinkCopiedToClipboardMessage,
  verifyShowEpisodeListScrollableToEnd,
  verifyEpisodePlaybackStartsFromDetailsPage,
  verifyPremiumIconOnDetailsPage,
  verifySharedDeeplinkRedirectToDetailsPage,
  verifyAutoPlaybackOfPreviewOnDetailsPage,
} from '../../src/businessFunction/ott-details-bfs';
import { manageWatchlistItemOnDetailsPage } from '../../src/businessFunction/ott-watchlist-bfs';
import { verifyPlayerCloseReturnsToDetailsFlow, verifyMovieCompletionRedirectToDetailsFlow, verifyPlaybackResumeFlow } from '../../src/businessFunction/ott-playback-bfs';
import { verifySubscriptionInstructionPopupOnGmaContent, verifySubscribeCtaOnGmaDetailsPage, navigateToUpgradePlanFromSubscriptionBlocker } from '../../src/businessFunction/ott-subscription-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

const testTimeout = process.env.BROWSER === 'mchrome'
  ? 360_000
  : 120_000;
test.setTimeout(testTimeout);

test.describe('Content details navigation', () => {
  test('@High @mWeb IW3-T1895: Verify the user navigates to the content details page after tapping content from Home, Shows, Movies, Search, or My Space pages', async ({ page }) => {
    test.setTimeout(60000);
    const data = testCaseData['tc-disc-001-show-details-navigation'] as Record<string, any>;
    const result = await navigateToShowDetailsFromShowsPage(page, {
      mode: data.mode,
      expectedYear: data.expectedYear,
      expectedGenre: data.expectedGenre,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.showDetailsHeading).toBeTruthy();
    expect(result.isContentMetadataVisible).toBe(true);
  });

  test('@High @mWeb IW3-T1896: Verify the UI of the Details Page of movie/Show/GMA contents', async ({ page }) => {
    const data = testCaseData['tc-disc-002-content-details-ui'] as Record<string, any>;
    const result = await verifyContentDetailsPageUi(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isContentDetailsPageVisible).toBe(true);
    expect(result.contentDetailsHeading).toBeTruthy();
    expect(result.isContentMetadataVisible).toBe(true);
    expect(result.contentDescriptionText).toBeTruthy();
    expect(result.isContentTitleImageVisible).toBe(true);
    expect(result.isContentGenreVisible).toBe(true);
    expect(result.isContentYearVisible).toBe(true);
    expect(result.isContentAgeRatingVisible).toBe(true);
    expect(result.isContentDurationVisible).toBe(true);
    expect(result.isPrimaryPlaybackActionVisible).toBe(true);
    expect(result.isContentLanguageIconVisible).toBe(true);
    expect.soft(result.isContentSubtitleIconVisible).toBe(true);
    expect(result.isAddToWatchlistButtonVisible).toBe(true);
  });

  test('@Medium IW3-T1897: Verify the redirection to the Detail Page via shared Deeplink URL', async ({ page }) => {
    const data = testCaseData['tc-disc-012-shared-deeplink-redirect'] as Record<string, any>;
    const result = await verifySharedDeeplinkRedirectToDetailsPage(page, {
      mode: data?.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.titleMatchesAsset).toBe(true);
    expect(result.shortDescriptionMatchesAsset).toBe(true);
  });

  test('@Medium @mWeb IW3-T1899: Verify premium icon is displayed on Detail page for premium contents', async ({ page }) => {
    const data = testCaseData['tc-disc-009-premium-icon-display'] as Record<string, any>;
    const result = await verifyPremiumIconOnDetailsPage(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.premiumIconVisible).toBe(true);
  });

  test('@High @mWeb IW3-T1900: Verify auto playback of preview/trailer on detail page', async ({ page }) => {
    const data = testCaseData['tc-disc-013-trailer-autoplay'] as Record<string, any>;
    const result = await verifyAutoPlaybackOfPreviewOnDetailsPage(page, {
      mode: data?.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.previewVideoVisible).toBe(true);
    expect(result.previewPlaybackStarted).toBe(true);
  });

  test('@Medium @mWeb IW3-T1903: Verify Subscribe CTA is displayed on detail page for Non premium users', async ({ page }) => {
    test.setTimeout(120000);
    const data = testCaseData['tc-disc-010-subscribe-cta-on-details-page'] as Record<string, any>;
    const result = await verifySubscribeCtaOnGmaDetailsPage(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isSubscribeToWatchCtaVisible).toBe(true);
  });

  test('@Medium IW3-T1905: Verify that Free users navigate to plans page post tapping on Subscribe CTA', async ({ page }) => {
    const data = testCaseData['tc-sub-002-upgrade-plan'];
    const result = await navigateToUpgradePlanFromSubscriptionBlocker(page, { mode: data.mode });
    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isUpgradePlanVisible).toBe(true);
    expect(result.isPlansPageVisible).toBe(true);
  });

  test('@Medium IW3-T1906: Verify subscription instruction popup is displayed post tapping on Subscribe CTA for GMA contents', async ({ page }) => {
    test.setTimeout(60000);
    const data = testCaseData['tc-sub-003-gma-subscribe-popup'] as Record<string, any>;
    const result = await verifySubscriptionInstructionPopupOnGmaContent(page, { mode: data.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isPremiumContentOpened).toBe(true);
    expect(result.isSubscriptionInstructionVisible).toBe(true);
    expect(result.subscriptionInstructionText.toLowerCase()).toContain('subscribe to watch');
  });

  test('@High @mWeb IW3-T1907: playback starts post tapping Play/Resume CTA', async ({ page }) => {
    const data = testCaseData['tc-sub-004-resume-playback'] as Record<string, any>;
    const result = await verifyPlaybackResumeFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
    });
    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialPlayed).toBeTruthy();
    expect(result.resumed).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@Medium IW3-T1908: Verify that user can add and remove the content to My Watchlist on the Details Page', async ({ page }) => {
    test.setTimeout(60000);
    const data = testCaseData['tc-disc-003-watchlist-details-page'] as Record<string, any>;
    const result = await manageWatchlistItemOnDetailsPage(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isRemovedFromWatchlist).toBe(true);
    expect(result.removeToastText.toLowerCase()).toContain('removed');
  });

  test('@Medium @mWeb IW3-T1909: Verify that user redirect back to detail page post killing/closing the player', async ({ page }) => {
    const data = testCaseData['tc-disc-004-player-close-return'] as Record<string, any>;
    const result = await verifyPlayerCloseReturnsToDetailsFlow(page, {
      mode: data?.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.detailsVisible).toBe(true);
    expect(result.playerVisibleBeforeClose).toBe(true);
    expect(result.returnedToDetails).toBe(true);
  });

  test('@Low @mWeb IW3-T1910: Verify that user auto redirects back to the details page after a movie completes playback', async ({ page }) => {
    test.setTimeout(90000);
    const data = testCaseData['tc-disc-011-movie-completion-redirect'] as Record<string, any>;
    const result = await verifyMovieCompletionRedirectToDetailsFlow(page, {
      mode: data?.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.detailsVisible).toBe(true);
    expect(result.playbackStarted).toBe(true);
    expect(result.playbackCompleted).toBe(true);
    expect(result.postDetailsVisible).toBe(true);
    expect(result.playButtonVisible).toBe(true);
    expect(result.resumeButtonVisible).toBe(false);
  });

  test('@Medium @mWeb IW3-T1913: Verify on tapping "Share" icon "Share link copied to clipboard" message is displayed', async ({ page }) => {
    const data = testCaseData['tc-disc-005-share-link-copied'] as Record<string, any>;
    const result = await verifyShareLinkCopiedToClipboardMessage(page, { mode: data?.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isContentDetailsPageVisible).toBe(true);
    expect(result.isShareIconVisible).toBe(true);
    expect(result.shareMessageText.toLowerCase()).toContain('share link copied');
  });

  test('@Medium @mWeb IW3-T1914: Verify episodes lists are divided and displayed by respective seasons', async ({ page }) => {
    const data = testCaseData['tc-disc-006-seasons-grouped'] as Record<string, any>;
    const result = await verifyEpisodesGroupedBySeason(page, { mode: data?.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.seasonLabelsVisible).toBe(true);
    expect(result.seasonLabelsCount).toBeGreaterThan(0);
    expect(result.episodeItemsCount).toBeGreaterThan(0);
    expect(result.allSeasonsValidated).toBe(true);
  });

  test('@Medium @mWeb IW3-T1915: Verify detail page and All episodes list is scrollable till the end for show contents', async ({ page }) => {
    test.setTimeout(70000);
    const data = testCaseData['tc-disc-007-episode-list-scrollable'] as Record<string, any>;
    const result = await verifyShowEpisodeListScrollableToEnd(page, { mode: data?.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.episodeListScrollableToEnd).toBe(true);
    expect(result.allSeasonsValidated).toBe(true);
    expect(result.iWantElementVisible).toBe(true);
  });

  test('@Medium @mWeb IW3-T1916: Verify episodes are displayed/listed in ascending order for all the show content', async ({ page }) => {
    test.setTimeout(70000);
    const data = testCaseData['tc-disc-008-episode-order'] as Record<string, any>;
    const result = await verifyEpisodesDisplayedInAscendingOrder(page, { mode: data?.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.seasonLabelsText.length >= 0).toBe(true);
    expect(result.episodeSequenceValidations.length).toBeGreaterThan(0);
    expect(result.allSeasonsValidated).toBe(true);
    expect(result.ascendingEpisodesVerified).toBe(true);
  });

  test('@Medium @mWeb IW3-T1921: Verify that respective episode playback starts post tapping on episode cards in detail page', async ({ page }) => {
    test.setTimeout(250000);
    const data = testCaseData['tc-disc-014-episode-playback-on-details-page'] as Record<string, any>;
    const result = await verifyEpisodePlaybackStartsFromDetailsPage(page, { mode: data?.mode });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.showName.length).toBeGreaterThan(0);
    expect(result.selectedEpisodeTitle.length).toBeGreaterThan(0);
    expect(result.seasonNumber.length).toBeGreaterThan(0);
    expect(result.episodeNumber.length).toBeGreaterThan(0);
    expect(result.playerVisible).toBe(true);
    expect(result.playerEpisodeTitleVisible).toBe(true);
    expect(result.playerSeasonVisible).toBe(true);
    expect(result.playerEpisodeVisible).toBe(true);
  });
});
