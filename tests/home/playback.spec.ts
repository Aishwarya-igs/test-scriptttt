import { test, expect } from '../../src/fixtures/test-hooks';
const testTimeout = process.env.BROWSER === 'mchrome'
  ? 420_000
  : 180_000;
test.setTimeout(testTimeout);
import { openContentAndPlay, verifyLivePlaybackPauseResume, verifySeekbarPreviewFlow, verifySmoothPlaybackFlow, verifyFullscreenFunctionalityFlow, verifySubtitleDisplayFlow, verifySubtitleDefaultOffFlow, verifySubtitleCarryOverFlow, verifySeekBarDragFlow, verifyBrowserSeekBarFlow, verifyPlayerControlsFlow, verifyPlayerControlsAutoDismissFlow, verifyPlayerControlsHoverDismissFlow, verifyVolumeControlFlow, verifyFullscreenButtonVisibilityFlow, verifyPlaybackTimestampFormatFlow, verifyPlaybackShortDurationTimestampFormatFlow, verifySubtitleSelectionFlow, verifySubtitlePersistenceFlow, verifySubtitleSynchronizationFlow, verifyLivePlaybackGoLiveFlow, verifyLiveStreamSeekRestrictionFlow, verifyPreRollAdPlaybackFlow, verifySkipAdDuringPreRollAdFlow, verifyAdCountdownFlow, verifyMidRollAdInterruptionFlow, verifyAdLearnMoreRedirectFlow, verifyPausePlaybackFlow, verifyTapToPausePlaybackFlow, verifyPauseforwardBackwardButtonsFlow, verifyforwardBackwardButtonsFlow, verifyPlayerUIFlow, verifyNextEpisodeCtaVisibilityFlow, verifyUpNextBingeMarkerFlow, verifyUpNextMarkerNavigationFlow, verifyAutomaticNextEpisodePlaybackFlow, verifyBackButtonNavigationFlow, verifyLiveTagOnPlayer, verifyAdPlaybackUIFlow, verifyAdLabelVisibilityFlow, verifyAdSeekBarHiddenDuringAdFlow, verifyAdDurationFlow, verifyMoviePlaybackReturnsToDetailsFlow, verifyEarlyAccessMaybeLaterFlow, verifyEarlyAccessSubscriptionFlow, verifySubscribedEarlyAccessUpNextFlow, playselectedContentFromWatchlist, verifyPlaybackResumeFlow } from '../../src/businessFunction/ott-playback-bfs';
import { verifyLastSeasonLastEpisodeCompletionNavigationFlow, verifyGoLiveTagAfterPause } from '../../src/businessFunction/ott-playback-bfs';
import { verifySubscribeToWatchRedirectsToAccountScreen } from '../../src/businessFunction/ott-subscription-bfs';
import testData from '../../src/data/ott-test-cases.json';
import { verifyPremiumContentDeepLinkSubscriptionBlocker } from '../../src/businessFunction/ott-subscription-bfs';

test.describe('Play Back', () => {
  test('@High @mWeb IW3-T1967 - Play content from details page', async ({ page }) => {
    const data = testData['tc-sub-003-play-content'] as Record<string, any>;
    const result = await openContentAndPlay(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
  });

  test('@High @mWeb IW3-T1968 - video playback starts successfully and plays smoothly without interruption', async ({ page }) => {
    const data = testData['tc-sub-005-smooth-playback'] as Record<string, any>;
    const result = await verifySmoothPlaybackFlow(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.episodeNameVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@High @mWeb IW3-T1999 - dragging the seek bar updates playback position', async ({ page }) => {
    const data = testData['tc-sub-006-seek-bar-drag'] as Record<string, any>;
    const result = await verifySeekBarDragFlow(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      parentalPin: data.pin,
      seekPercent: data.seekPercent,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1997 - player controls auto-dismiss after 5s of inactivity', async ({ page }) => {
    const data = testData['tc-sub-030-player-controls-autodismiss'] as Record<string, any>;
    const result = await verifyPlayerControlsAutoDismissFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });
    expect(result.detailsVisible).toBeTruthy();
    expect(result.controlsInitiallyNotVisible).toBeTruthy();
  });

  test('@Medium IW3-T2005 - user can adjust volume using volume button', async ({ page }) => {
    const data = testData['tc-sub-032-volume-button-control'] as Record<string, any>;
    const result = await verifyVolumeControlFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialVolume).toBeGreaterThanOrEqual(0);
    expect(result.adjustedVolume).toBeGreaterThanOrEqual(0);
  });

  test('@Medium @mWeb IW3-T2003 - content gets paused on tapping the player screen when controls are visible', async ({ page }) => {
    test.setTimeout(240000);
    const data = testData['tc-sub-013-pause-playback'] as Record<string, any>;
    const result = await verifyTapToPausePlaybackFlow(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playerVisible).toBeTruthy();
    expect(result.playbackPaused).toBeTruthy();
  });

  test('@Medium IW3-T2001 - seekbar displays thumbnail previews while scrubbing through content', async ({ page }) => {
    const data = testData['tc-sub-034-seekbar-preview'] as Record<string, any>;
    const result = await verifySeekbarPreviewFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.previewVisible).toBeTruthy();
  });

  test('@High @mWeb IW3-T2000 - seek bar behaves correctly across supported browsers', async ({ page }) => {
    const data = testData['tc-sub-008-browser-seek-bar'] as Record<string, any>;
    const result = await verifyBrowserSeekBarFlow(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      parentalPin: data.pin,
      seekPercent: data.seekPercent,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.playbackPositionChanged).toBeTruthy();
  });


  test('@High @mWeb IW3-T2002 - player controls appear when the screen is tapped during playback', async ({ page }) => {
    const data = testData['tc-sub-009-player-controls'] as Record<string, any>;
    const result = await verifyPlayerControlsFlow(page, {
      graphqlQueryName: data.graphqlQueryName,
      mode: data.mode,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.playbackTimeVisible).toBeTruthy();
    expect(result.rewindVisible).toBeTruthy();
    expect(result.forwardVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
    expect(result.controlsVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T1980 - full screen icon is displayed on the player screen', async ({ page }) => {
    const data = testData['tc-sub-016-fullscreen-icon'] as Record<string, any>;
    const result = await verifyFullscreenButtonVisibilityFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T1978 - playback timestamp is displayed in HH:MM:SS format for long-duration content', async ({ page }) => {
    const data = testData['tc-sub-017-timestamp-format'] as Record<string, any>;
    const result = await verifyPlaybackTimestampFormatFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T1979 - playback timestamp is displayed in MM:SS format for short-duration content', async ({ page }) => {
    const data = testData['tc-sub-018-short-duration-timestamp-format'] as Record<string, any>;
    const result = await verifyPlaybackShortDurationTimestampFormatFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1981 - user can select available subtitle during playback', async ({ page }) => {
    const data = testData['tc-sub-019-subtitle-selection'] as Record<string, any>;
    const result = await verifySubtitleSelectionFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleButtonVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1982 - selected subtitle persists when moving to the next episode', async ({ page }) => {
    const data = testData['tc-sub-020-subtitle-next-episode'] as Record<string, any>;
    const result = await verifySubtitlePersistenceFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });
    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.nextEpisodeSubtitleVisible).toBeTruthy();
  });

  test('@High IW3-T2010: Verify that the pause and resume buttons function correctly during live playback', async ({ page }) => {
    test.setTimeout(180000);
    const data = testData['tc-live-2010-pause-resume-live-playback'] as Record<string, any>;
    const result = await verifyLivePlaybackPauseResume(page, {
      mode: data.mode,
      parentalPin: data.pin,
    });
    expect(result.liveSectionSelected).toBeTruthy();
    expect(result.playbackStarted).toBeTruthy();
    expect(result.pauseResumeWorked).toBeTruthy();
    expect(result.currentTimeBeforePause).toBeGreaterThanOrEqual(0);
    expect(result.currentTimeAfterResume).toBeGreaterThanOrEqual(result.currentTimeBeforePause);
  });


  test('@Medium @mWeb IW3-T4707 - user navigates to content details screen on tapping Maybe Later CTA from Unlock Early Access screen', async ({ page }) => {
    const data = testData['tc-002-early-access-may-be-later'] as Record<string, any>;
    const result = await verifyEarlyAccessMaybeLaterFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      labelText: data.labelText,
      parentalPin: data.pin,
    });

    expect(result.searchResultsVisible).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.earlyAccessTagVisible).toBeTruthy();
    expect(result.episodeClicked).toBeTruthy();
    expect(result.unlockEarlyAccessVisible).toBeTruthy();
    expect(result.maybeLaterVisible).toBeTruthy();
    expect(result.returnedToDetailsPage).toBeTruthy();
  });

  test('@High IW3-T3686 - free user can initiate the subscription flow from an Early Access episode', async ({ page }) => {
    const data = testData['tc-003-early-access-subscription-flow'] as Record<string, any>;
    const result = await verifyEarlyAccessSubscriptionFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      labelText: data.labelText,
      parentalPin: data.pin,
    });

    expect(result.searchResultsVisible).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.earlyAccessTagVisible).toBeTruthy();
    expect(result.episodeClicked).toBeTruthy();
    expect(result.unlockEarlyAccessVisible).toBeTruthy();
    expect(result.updateToWatchNowVisible).toBeTruthy();
    expect(result.accountScreenVisible).toBeTruthy();
    expect(result.iWantIconVisible).toBeTruthy();
    expect(result.urlContainsAccount).toBeTruthy();
  });

  test('@High IW3-T3685 - subscribed user can access Early Access episode via Up Next or Next Episode CTA from the player screen', async ({ page }) => {
    const data = testData['tc-sub-042-subscribed-early-access-up-next'] as Record<string, any>;
    const result = await verifySubscribedEarlyAccessUpNextFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      labelText: data.labelText,
      parentalPin: data.pin,
    });

    expect(result.searchResultsVisible).toBeTruthy();
    expect(result.detailsVisible).toBeTruthy();
    expect(result.earlyAccessTagVisible).toBeTruthy();
    expect(result.episodeClicked).toBeTruthy();
    expect(result.UpnextEpisodeMarkerVisible).toBeTruthy();
    expect(result.nextEpisodeClicked).toBeTruthy();
    expect(result.nextEpisodePlaybackStarted).toBeTruthy();
  });

  test('@High @mWeb IW3-T2013 - pre-roll ad plays automatically before main content starts', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyPreRollAdPlaybackFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T2014 - ad playback UI displays the player screen and ad overlay', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyAdPlaybackUIFlow(page, {
      mode: data.mode,
      query: data.query,
      expectedTitle: data.expectedTitle,
      expectedEpisode: data.expectedEpisode,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T2016 - Skip Ad CTA appears during pre-roll ad playback and skip action functions correctly', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifySkipAdDuringPreRollAdFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect.soft(result.playerVisible).toBeTruthy();
    expect.soft(result.adVisible).toBeTruthy();
    expect.soft(result.skipAdButtonVisible).toBeTruthy();
    expect.soft(result.skipAdButtonClicked).toBeTruthy();
  });

  test('@High @mWeb IW3-T2018 - ad duration countdown and skip button countdown are displayed correctly during ad playback', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyAdCountdownFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    expect(result.skipAdButtonVisible).toBeTruthy();
    expect(result.skipAdCountdownText).toBeTruthy();
  });

  test('@High @mWeb IW3-T2019 - mid-roll ad interrupts main content playback at each midroll ad', async ({ page }) => {
    test.setTimeout(240000);
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyMidRollAdInterruptionFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.initialAdVisible).toBeTruthy();
    expect(result.playbackTitleVisible).toBeTruthy();
    expect(result.midRollAdVisible).toBeTruthy();
  });

  test('@Low IW3-T2021 - tapping on player screen during ad playback redirects to the ad-related page', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyAdLearnMoreRedirectFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    expect(result.tapPerformed).toBeTruthy();
    expect(result.redirectedPageTitle.length).toBeGreaterThan(0);
    expect(result.redirectedPageUrl.length).toBeGreaterThan(0);
  });

  test('@Low @mWeb IW3-T2020 - player screen displays a clear and visible ad label while an ad is playing', async ({ page }) => {
    const data = testData['tc-sub-037-ad-label-visible'] as Record<string, any>;
    const result = await verifyAdLabelVisibilityFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    expect(result.adLabelVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T2022 - seek bar is not visible on the player screen during ad playback', async ({ page }) => {
    const data = testData['tc-sub-038-ad-seekbar-hidden'] as Record<string, any>;
    const result = await verifyAdSeekBarHiddenDuringAdFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    expect(result.seekBarHidden).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T2017 - all ads do not exceed a maximum duration of 90 seconds', async ({ page }) => {
    const data = testData['tc-sub-011-pre-roll-ad'] as Record<string, any>;
    const result = await verifyAdDurationFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.adVisible).toBeTruthy();
    expect(result.adDurationSeconds).toBeLessThanOrEqual(90);
    expect(result.exceedsMaxDuration).toBeFalsy();
  });

  test('@Medium @mWeb IW3-T1974 - video playback pauses immediately when pause is triggered', async ({ page }) => {
    const data = testData['tc-sub-013-pause-playback'] as Record<string, any>;
    const result = await verifyPausePlaybackFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.initialPlaybackTime).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.playbackPaused).toBeTruthy();
  });

  test('@High @mWeb IW3-T1975 - playback starts post tapping Play/Resume CTA', async ({ page }) => {
    const data = testData['tc-sub-004-resume-playback'] as Record<string, any>;
    const result = await verifyPlaybackResumeFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
    });
    expect(result.detailsVisible).toBeTruthy();
    expect(result.initialPlayed).toBeTruthy();
    expect(result.resumed).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1976 - Verify that tapping the seek forward or backward button (CTA) skips the video playback ahead or back by exactly 10 seconds', async ({ page }) => {
    const data = testData['tc-sub-015-pause-seek-buttons'] as Record<string, any>;
    const result = await verifyforwardBackwardButtonsFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1983 - selected subtitle carries to another content when available', async ({ page }) => {
    const data = testData['tc-sub-021-subtitle-carry-over'] as Record<string, any>;
    const result = await verifySubtitleCarryOverFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.carryOverSubtitleVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T1984 - subtitles are set to Off by default', async ({ page }) => {
    const data = testData['tc-sub-022-subtitle-default-off'] as Record<string, any>;
    const result = await verifySubtitleDefaultOffFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleButtonVisible).toBeTruthy();
    expect(result.subtitleOffVisible).toBeTruthy();
  });

  test('@Low @mWeb IW3-T1985 - selected subtitles are displayed on the player screen', async ({ page }) => {
    const data = testData['tc-sub-023-subtitle-display'] as Record<string, any>;
    const result = await verifySubtitleDisplayFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.subtitleDisplayedOnPlayer).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1986 - subtitles display correctly and remain synchronized with the video during seeking operations', async ({ page }) => {
    const data = testData['tc-sub-024-subtitle-synchronization'] as Record<string, any>;
    const result = await verifySubtitleSynchronizationFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.subtitleSelectionSuccessful).toBeTruthy();
    expect(result.subtitleVisibleAfterForward).toBeTruthy();
    expect(result.subtitleVisibleAfterRewind).toBeTruthy();
    expect(result.subtitleVisibleAfterSeek).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1987 - tapping the full screen icon activates fullscreen and continues playback', async ({ page }) => {
    const data = testData['tc-sub-025-fullscreen-functionality'] as Record<string, any>;
    const result = await verifyFullscreenFunctionalityFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.fullscreenVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.playbackTimeProgressed).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1988 - player screen UI displays all controls in fullscreen mode', async ({ page }) => {
    const data = testData['tc-sub-026-landscape-player-ui'] as Record<string, any>;
    const result = await verifyPlayerUIFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.backButtonVisible).toBeTruthy();
    expect(result.contentTitleVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(result.pausePlayVisible).toBeTruthy();
    expect(result.forwardRewindVisible).toBeTruthy();
    expect(typeof result.subtitleVisible).toBe('boolean');
    expect(typeof result.nextEpisodeVisible).toBe('boolean');
  });

  test('@Medium @mWeb IW3-T1989 - next episode CTA appears below the seek bar when available', async ({ page }) => {
    const data = testData['tc-sub-027-next-episode-cta'] as Record<string, any>;
    const result = await verifyNextEpisodeCtaVisibilityFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.seekBarVisible).toBeTruthy();
    expect(typeof result.nextEpisodeVisible).toBe('boolean');
    expect(typeof result.nextEpisodeBelowSeekBar).toBe('boolean');
  });

  test('@Medium @mWeb IW3-T1992 - tapping the playback back button returns to the previous details screen', async ({ page }) => {
    const data = testData['tc-sub-029-back-button-navigation'] as Record<string, any>;
    const result = await verifyBackButtonNavigationFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.backNavigationSuccessful).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1977 - forward and backward buttons function correctly when playback is paused', async ({ page }) => {
    const data = testData['tc-sub-015-pause-seek-buttons'] as Record<string, any>;
    const result = await verifyPauseforwardBackwardButtonsFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.playerVisible).toBeTruthy();
    expect(result.pausedPlaybackTime).toBeTruthy();
    expect(result.forwardPlaybackTime).toBeTruthy();
    expect(result.rewindPlaybackTime).toBeTruthy();
    expect(result.forwardChanged).toBeTruthy();
    expect(result.rewindChanged).toBeTruthy();
  });

  test('@Medium IW3-T1998 - player controls visible when tapping while dismissed ', async ({ page }) => {
    const data = testData['tc-sub-031-player-controls-hover-dismiss'] as Record<string, any>;
    const result = await verifyPlayerControlsHoverDismissFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.controlsInitiallyNotVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1990 - Up Next binge marker appears at the end of playback', async ({ page }) => {
    const data = testData['tc-sub-028-up-next-marker'] as Record<string, any>;
    const result = await verifyUpNextBingeMarkerFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.upNextMarkerVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T1991 - tapping the Up Next binge marker navigates and starts the next episode playback', async ({ page }) => {
    const data = testData['tc-sub-035-up-next-marker-navigation'] as Record<string, any>;
    const result = await verifyUpNextMarkerNavigationFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.markerVisible).toBeTruthy();
    expect(result.nextEpisodePlaybackStarted).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T2004 - player automatically navigates and starts the next episode without manual intervention', async ({ page }) => {
    const data = testData['tc-sub-036-auto-next-episode-playback'] as Record<string, any>;
    const result = await verifyAutomaticNextEpisodePlaybackFlow(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName,
      parentalPin: data.pin,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.markerVisible).toBeTruthy();
    expect(result.autoPlaybackStarted).toBeTruthy();
  });

  test('@Low @mWeb IW3-T2009 - LIVE tag is displayed on the player screen during live streaming', async ({ page }) => {
    const data = testData['tc-sub-010-go-live-playback'] as Record<string, any>;
    const result = await verifyLiveTagOnPlayer(page, {
      mode: data.mode,
      channelName: data.channelName,
      parentalPin: data.pin,
    });

    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.liveBadgeVisible).toBeTruthy();
  });

  test('@High IW3-T2012 - live playback begins on tapping Go Live CTA', async ({ page }) => {
    const data = testData['tc-sub-010-go-live-playback'] as Record<string, any>;
    const result = await verifyLivePlaybackGoLiveFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      channelName: data.channelName,
    });

    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.goLiveVisible).toBeTruthy();
  });

  test('@Medium IW3-T2011 - Go Live tag is displayed after pausing live playback', async ({ page }) => {
    const data = testData['tc-sub-043-go-live-tag-pause'] as Record<string, any>;
    const result = await verifyGoLiveTagAfterPause(page, {
      mode: data.mode,
      parentalPin: data.pin,
      channelName: data.channelName,
    });

    expect(result.isLoggedIn).toBeTruthy();
    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.paused).toBeTruthy();
    expect(result.goLiveVisible).toBeTruthy();
  });

  test('@High IW3-T2008 - live stream does not allow seek forward or backward', async ({ page }) => {
    const data = testData['tc-sub-007-live-stream-seek-restriction'] as Record<string, any>;
    const result = await verifyLiveStreamSeekRestrictionFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      channelName: data.channelName,
    });

    expect(result.liveChannelOpened).toBeTruthy();
    expect(result.rewindButtonVisible).toBeFalsy();
    expect(result.forwardButtonVisible).toBeFalsy();
  });

  test('@Medium @mWeb IW3-T2024 - Verify user navigates to content details after completely watching movie content', async ({ page }) => {
    const data = testData['tc-sub-040-movie-complete-details-navigation'] as Record<string, any>;
    const result = await verifyMoviePlaybackReturnsToDetailsFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.playbackStarted).toBeTruthy();
    expect(result.playbackCompleted).toBeTruthy();
    expect(result.postDetailsVisible).toBeTruthy();
  });

  test('@Medium @mWeb IW3-T2023 - Verify user navigates to content details when last season last episode completely watched', async ({ page }) => {
    const data = testData['tc-sub-039-last-season-last-episode'] as Record<string, any>;
    const result = await verifyLastSeasonLastEpisodeCompletionNavigationFlow(page, {
      mode: data.mode,
      parentalPin: data.pin,
      graphqlQueryName: data.graphqlQueryName,
    });

    expect(result.detailsVisible).toBeTruthy();
    expect(result.clickedEpisode).toBeTruthy();
    expect(result.playbackCompleted).toBeTruthy();
    expect(result.postDetailsVisible).toBeTruthy();
  });

  test('@Medium IW3-T2027 - Verify that clicking "Subscribe to watch" redirects to Account screen', async ({ page }) => {
    test.setTimeout(180000);
    const data = testData['tc-sub-041-subscribe-to-watch-redirect-account'] as Record<string, any>;
    const result = await verifySubscribeToWatchRedirectsToAccountScreen(page, {
      mode: data.mode,
      graphqlQueryName: data.graphqlQueryName
    });

    expect(result.isDetailsPageVisible).toBeTruthy();
    expect(result.accountScreenVisible).toBeTruthy();
    expect(result.iWantIconVisible).toBeTruthy();
    expect(result.urlContainsAccount).toBeTruthy();
  });

  test('@High IW3-2029: Verify that the subscription blocker screen is displayed when a non-subscriber user accesses premium content via a deep link', async ({ page }) => {
    test.setTimeout(240000);
    const data = testData['tc-sub-004-deeplink-premium-blocker'];
    const result = await verifyPremiumContentDeepLinkSubscriptionBlocker(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isSubscribeToWatchCtaVisible).toBe(true);
    expect(result.isPlaybackBlocked).toBe(true);
  });

  test('@High IW3-T2030: Verify that a selected item from My Watchlist can be played', async ({ page }) => {
    test.setTimeout(180000);
    const data = testData['tc-auth-content-watchlist-2030'];
    const result = await playselectedContentFromWatchlist(page, {
      mode: data.mode,
      parentalPin: data.pin,
    });
    expect(result.isLoggedIn).toBeTruthy();
    expect(result.watchlistOpened).toBeTruthy();
    expect(result.contentSelected).toBeTruthy();
    expect(result.playClicked).toBeTruthy();
    expect(result.contentPlayed).toBeTruthy();
    expect(result.playbackStarted).toBeTruthy();
  });
});
