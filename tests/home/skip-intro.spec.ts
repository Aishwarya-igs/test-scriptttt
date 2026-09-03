import { test, expect } from '../../src/fixtures/test-hooks'
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { verifySkipIntroMarkerDuringPlayback, verifySkipIntroFunctionalityDuringPlayback, verifySkipRecapMarkerDuringPlayback, verifySkipRecapFunctionalityDuringPlayback, verifySkipIntroAndRecapAdvancePlaybackDuration } from '../../src/businessFunction/ott-details-bfs';
import { verifySkipMarkerVisibilityAfterPauseResume, verifySkipMarkersReappearAfterRewind, verifySkipMarkersNotVisibleInContinueWatching, verifyUpNextBingeMarkerFlow, verifyUpNextMarkerFunctionalityFlow, verifyUpNextCloseButtonFlow, verifyUpNextMarkerClickNavigationFlow } from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
const testTimeout = process.env.BROWSER === 'mchrome'
  ? 240_000
  : 120_000;
test.setTimeout(testTimeout);

test.describe('Playback skip intro marker', () => {
  
  test('@High @mWeb IW3-T2112: Verify presence of Skip Intro marker during initial content playback', async ({ page }) => {
    const data = testCaseData['tc-disc-004-skip-intro'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipIntroMarkerDuringPlayback(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });
    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipIntroMarkerVisible).toBe(true);
  });

  test('@High  IW3-T2113: Verify functionality of Skip Intro marker during playback', async ({ page }) => {
    const data = testCaseData['tc-disc-004-skip-intro'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipIntroFunctionalityDuringPlayback(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      parentalPin: data.pin,
    });

    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipIntroMarkerVisible).toBe(true);
    expect(playbackResult.skipIntroClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipIntro).not.toBe(playbackResult.timeAfterSkipIntro);
  });

  test('@High @mWeb IW3-T2114: Verify presence of Skip Recap marker during initial content playback', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-disc-005-skip-recap'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipRecapMarkerDuringPlayback(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });

    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisible).toBe(true);
  });

  test('@High IW3-T2115: Verify functionality of Skip Recap marker during playback', async ({ page }) => {
    const data = testCaseData['tc-disc-006-skip-recap'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipRecapFunctionalityDuringPlayback(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      parentalPin: data.pin,
    });

    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisible).toBe(true);
    expect(playbackResult.skipRecapClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipRecap).not.toBe(playbackResult.timeAfterSkipRecap);
  });

  test('@Medium IW3-T2120: Verify that skip markers remain visible after pausing or resuming content playback', async ({ page }) => {
    const data = testCaseData['tc-disc-007-skip-outro'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipMarkerVisibilityAfterPauseResume(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.playerVisible).toBe(true);
    expect(playbackResult.markerVisibleBeforePause).toBe(true);
    expect(playbackResult.markerVisibleAfterPause).toBe(true);
    expect(playbackResult.markerVisibleAfterResume).toBe(true);
  });

  test('@Medium  IW3-T2121: Verify that clicking Skip Intro and Skip Recap advances playback by a measurable duration', async ({ page }) => {
    const data = testCaseData['tc-disc-006-skip-recap'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipIntroAndRecapAdvancePlaybackDuration(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      parentalPin: data.pin,
    });

    expect(playbackResult.isDetailsPageVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisible).toBe(true);
    expect(playbackResult.skipRecapClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipRecap).not.toBe(playbackResult.timeAfterSkipRecap);
    expect(playbackResult.isSkipIntroMarkerVisible).toBe(true);
    expect(playbackResult.skipIntroClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipIntro).not.toBe(playbackResult.timeAfterSkipIntro);
  });

  test('@Medium IW3-T2122: Verify that skip markers reappear after content is rewound', async ({ page }) => {
    const data = testCaseData['tc-disc-006-skip-recap'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    const playbackResult = await verifySkipMarkersReappearAfterRewind(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      parentalPin: data.pin,
    });

    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisible).toBe(true);
    expect(playbackResult.skipRecapClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipRecap).not.toBe(playbackResult.timeAfterSkipRecap);
    expect(playbackResult.isSkipIntroMarkerVisible).toBe(true);
    expect(playbackResult.skipIntroClicked).toBe(true);
    expect(playbackResult.timeBeforeSkipIntro).not.toBe(playbackResult.timeAfterSkipIntro);
    expect(playbackResult.upNextVisible).toBe(true);
    expect(playbackResult.isSkipRecapMarkerVisibleAfterSeekToStart).toBe(true);
  });

  test('@High  IW3-T2116: Verify presence of Skip Outro(Up Next) binge marker at end of the content playback', async ({ page }) => {
    const data = testCaseData['tc-sub-028-up-next-marker'] as Record<string, any>;
    const playbackResult = await verifyUpNextBingeMarkerFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.upNextMarkerVisible).toBe(true);
  });

  test('@High  IW3-T2117: Verify functionality of Skip Outro(Up Next) binge marker', async ({ page }) => {
    const data = testCaseData['tc-sub-037-up-next-marker-functionality'] as Record<string, any>;
    const playbackResult = await verifyUpNextMarkerFunctionalityFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(playbackResult.isLoggedIn).toBe(true);
    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.upNextMarkerVisible).toBe(true);
    expect(playbackResult.timeBeforeMarkerClick).not.toBe(playbackResult.timeAfterMarkerClick);
    expect(playbackResult.nextEpisodePlaybackStarted).toBe(true);
  });

  test('@High  IW3-T2118: Verify that the X button is displayed on the Up Next binge marker to close the outro', async ({ page }) => {
    const data = testCaseData['tc-sub-038-up-next-close-button'] as Record<string, any>;
    const playbackResult = await verifyUpNextCloseButtonFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(playbackResult.isLoggedIn).toBe(true);
    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.upNextMarkerVisible).toBe(true);
    expect(playbackResult.closeButtonVisible).toBe(true);
    expect(playbackResult.upNextMarkerClosed).toBe(true);
    expect(playbackResult.playbackContinued).toBe(true);
  });

  test('@High  IW3-T2119: Verify clicking the Up Next binge marker moves to the next episode', async ({ page }) => {
    const data = testCaseData['tc-sub-039-up-next-marker-click-navigation'] as Record<string, any>;
    const playbackResult = await verifyUpNextMarkerClickNavigationFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(playbackResult.isLoggedIn).toBe(true);
    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.markerVisible).toBe(true);
    expect(playbackResult.markerClicked).toBe(true);
    expect(playbackResult.nextEpisodePlaybackStarted).toBe(true);
  });

  test('@High IW3-T2123: Verify Skip Intro and Skip Recap markers are not displayed for content under the Continue Watching tray', async ({ page }) => {
    const data = testCaseData['tc-disc-008-skip-markers-continue-watching'] as Record<string, any>;
    const playbackResult = await verifySkipMarkersNotVisibleInContinueWatching(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
      parentalPin: data.pin,
    });

    expect(playbackResult.isLoggedIn).toBe(true);
    expect(playbackResult.detailsVisible).toBe(true);
    expect(playbackResult.episodeOpened).toBe(true);
    expect(playbackResult.continueWatchingContentOpened).toBe(true);
    expect(playbackResult.markersNotVisible).toBe(true);
  });
});

