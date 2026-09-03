import { test, expect } from '../../src/fixtures/test-hooks';
import {
    verifyPauseAdForMicroDramaFlow, verifyPauseAdLiveContentPlaybackFlow, verifyPauseAdAbsenceForPremiumOrGmaFlow, verifyBillboardAdBannerVisibilityFlow,
    verifyPauseAdAppearsOnPlayerScreenFlow, verifyPauseAdDisappearsOnResumeFlow, verifyPauseAdNotDisplayedWhilePlayingFlow,
    verifyPauseAdSeekRestrictionGraphQLFreeContentFlow, verifyPauseAdDismissCtaVisibilityFlow, verifyPauseAdNoOverlapWithDismissAndTitleFlow, verifyPauseAdNoOverlapWithUpNextMarkerFlow, verifyPauseAdRepeatedPausesFlow,
    verifyPauseScreenForPremiumOrGmaFlow, verifyPauseAdBackNavigationFlow, verifyPauseAdControlsDismissedFlow, verifyPauseAdClickableFlow, verifyPauseAdFullscreenFlow, verifyMidRollAdFullscreenFlow, verifyNextEpisodePlaybackInFullscreenFlow,
    verifyPauseAdNotDisplayedOnSkipIntroRecapGoLiveFlow, verifyPauseAdDisplaysForDifferentUsersFlow
} from '../../src/businessFunction/ott-playback-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyMidRailBannerAdlVisibility, verifySponsoredRailAdvertiserLogo, verifySponsoredRailVisibility, verifySponsoredRailNonClickability } from '../../src/businessFunction/ott-landing-bfs';
import { verifyPauseAdNoReappearWithin3SecFlow, verifySponsoredRailContentDetailsNavigation } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Ads', () => {
    test('@High IW3-T3648 : Verify Mid rail banner Ad is Displayed on Home, Shows, Movies, GMA, Search pages', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-037-mid-rail-banner-adl'];
        const result = await verifyMidRailBannerAdlVisibility(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.allPagesVisible).toBe(true);
    });
    test('@High IW3-T3978: Verify pause ad appears on player screen for all types of content during pause state', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-3978-pause-ad-player-screen'];
        const result = await verifyPauseAdAppearsOnPlayerScreenFlow(page, {
            mode: data.mode,
            query: data.query,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.livePauseAdVisible).toBe(true);
        expect(result.moviePauseAdVisible).toBe(true);
        expect(result.showPauseAdVisible).toBe(true);
    });

    test('@High IW3-T3980: Verify billboard ad banner displays for guest, free, or basic users', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-3980-billboard-ad-banner'];
        const result = await verifyBillboardAdBannerVisibilityFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.adBannerVisible).toBe(true);
    });
    test('@Medium IW3-T3981: Verify pause ad is clickable by user interactions', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-3981-pause-ad-clickable'];
        const result = await verifyPauseAdClickableFlow(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T3985: Verify pause ad disappears on player screen when playback resumes', async ({ page }) => {
        test.setTimeout(210000);  
        const data = testCaseData['tc-ad-3985-pause-ad-disappears-on-resume'];
        const result = await verifyPauseAdDisappearsOnResumeFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisibleDuringPause).toBe(true);
        expect(result.pauseAdVisibleAfterResume).toBe(false);
    });
    test('@Medium IW3-T3986: Verify pause ad displays for different users', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-3986-pause-ad-different-users'];
        const result = await verifyPauseAdDisplaysForDifferentUsersFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            providerName: data.providerName,
        });
        expect(result.firstUserLoggedIn).toBe(true);
        expect(result.secondUserLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T3988: Verify pause ad appears on repeated pauses during playback', async ({ page }) => {
        test.setTimeout(270000);
        const data = testCaseData['tc-ad-3988-repeated-pauses'];
        const result = await verifyPauseAdRepeatedPausesFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.allPauseAdAttemptsVisible).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
        expect(result.returnToContentVisible).toBe(true);
        expect(result.playbackTitleVisible).toBe(true);
    });
    test('@Medium IW3-T3990: Verify that pause ads are displayed in the "Full" screen', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-3990-pause-ad-fullscreen'];
        const result = await verifyPauseAdFullscreenFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T3991: Verify that pause ads are not displayed for Premium or GMA plan users', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-3991-pause-ad-premium-or-gma'];
        const result = await verifyPauseAdAbsenceForPremiumOrGmaFlow(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(false);
    });
    test('@Medium IW3-T3992: Verify user should not be able to seek the content when the pause ad is displayed', async ({ page }) => {
        test.setTimeout(240000);
        const data = testCaseData['tc-ad-3992-pause-ad-seek-restriction'];
        const result = await verifyPauseAdSeekRestrictionGraphQLFreeContentFlow(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T3995: Verify that tapping back from the pause ad screen returns to the previous screen', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-3995-pause-ad-back-navigation'];
        const result = await verifyPauseAdBackNavigationFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
        expect(result.backNavigationSuccessful).toBe(true);
        expect(result.detailsPageVisible).toBe(true);
    });
    test('@Medium IW3-T3997: Verify that the "Dismiss Ad" CTA is displayed on the "Pause Ad" screen', async ({ page }) => {
        test.setTimeout(210000);
        const data = testCaseData['tc-ad-3997-dismiss-ad-cta'];
        const result = await verifyPauseAdDismissCtaVisibilityFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
        expect(result.returnToContentVisible).toBe(true);
        expect(result.playbackTitleVisible).toBe(true);
        expect(result.seekBarVisible).toBe(true);
    });
    test('@Medium IW3-T3998: Verify pause ads are displayed on pausing the live content as guest or free or basic user', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-3998-pause-ad-live-channel'];
        const result = await verifyPauseAdLiveContentPlaybackFlow(page, {
            mode: data.mode,
            liveContentName: data.liveContentName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T4003: Verify that pause ads do not reappear on re pausing within 3s after resuming', async ({ page }) => {
        test.setTimeout(190000);
        const data = testCaseData['tc-ad-4003-pause-ad-no-reappear-within-3s'];
        const result = await verifyPauseAdNoReappearWithin3SecFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisibleDuringPause).toBe(true);
        expect(result.pauseAdVisibleAfterImmediateRePause).toBe(false);
    });
    test('@High IW3-T4009: Verify that Pause Ads are displayed for Basic users when Micro Drama content is paused', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-4009-pause-ad-micro-drama'];
        const result = await verifyPauseAdForMicroDramaFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            query: data.query,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
    });
    test('@Medium IW3-T4010: Verify that Pause Ads are not displayed on Skip Intro / Skip Recap / Go Live CTA when the user pauses the content', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-4010-pause-ad-skip-intro-recap-go-live'];
        const result = await verifyPauseAdNotDisplayedOnSkipIntroRecapGoLiveFlow(page, {
            mode: data.mode,
            searchTerm: data.searchTerm,
            liveContentName: data.liveContentName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.skipRecapVisible).toBe(true);
        expect(result.skipRecapPauseAdVisible).toBe(true);
        expect(result.skipRecapVisibleAfterAd).toBe(false);
        expect(result.skipIntroVisible).toBe(true);
        expect(result.skipIntroPauseAdVisible).toBe(true);
        expect(result.skipIntroVisibleAfterAd).toBe(false)
        expect(result.goLiveVisible).toBe(true);
        expect(result.goLivePauseAdVisible).toBe(true);
        expect(result.goLiveVisibleAfterAd).toBe(false);
    });
    test('@Medium IW3-T4011: Verify that Pause Ads are not getting overlapped with the dismiss ad button and content title on player screen', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-4011-pause-ad-no-overlap'];
        const result = await verifyPauseAdNoOverlapWithDismissAndTitleFlow(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
        expect(result.returnToContentVisible).toBe(true);
        expect(result.overlapDetected).toBe(false);
    });
    test('@Medium @mWeb IW3-T4013: Verify "Next Episode" plays in full screen', async ({ page }) => {
        const testTimeout = process.env.BROWSER === 'mchrome'
        ? 600_000
        : 90_000;
        test.setTimeout(testTimeout);
        const data = testCaseData['tc-ad-4013-next-episode-fullscreen'];
        const result = await verifyNextEpisodePlaybackInFullscreenFlow(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.detailsVisible).toBe(true);
        expect(result.fullScreenActiveAfterUpNext).toBe(true);
        expect(result.nextEpisodePlaybackStarted).toBe(true);
    });
    test('@Medium IW3-T4014: Verify the pause screen is displayed for Movies and Shows content for Premium or GMA users', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-4014-pause-screen-premium-or-gma'];
        const result = await verifyPauseScreenForPremiumOrGmaFlow(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.moviePauseScreenVisible).toBe(true);
        expect(result.showPauseScreenVisible).toBe(true);
        expect(result.movieAdBannerVisible).toBe(false);
        expect(result.showAdBannerVisible).toBe(false);
    });
    test('@Medium IW3-T4015: Verify pause ads are not overlapped on the "Up Next" binge marker', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-4015-pause-ad-up-next-overlap'];
        const result = await verifyPauseAdNoOverlapWithUpNextMarkerFlow(page, {
            mode: data.mode,
            searchTerm: data.searchTerm,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.upNextVisibleBeforeAd).toBe(true);
        expect(result.pauseAdVisible).toBe(true);
        expect(result.upNextVisibleAfterPauseAd).toBe(false);
    });
    test('@Medium IW3-T4017: Verify "Pause Ads" are not displayed when the video is playing', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-4017-pause-ad-not-displayed-while-playing'];
        const result = await verifyPauseAdNotDisplayedWhilePlayingFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.pauseAdVisible).toBe(false);
    });

    test('@Medium IW3-T4018: Verify all the player controls gets dismissed when the "Pause Ad" is displayed', async ({ page }) => {
        test.setTimeout(500000);
        const data = testCaseData['tc-ad-4018-pause-ad-controls-dismissed'];
        const result = await verifyPauseAdControlsDismissedFlow(page, {
            mode: data.mode,
            query: data.query,
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.skipRecapVisible).toBe(true);
        expect(result.recapPauseAdVisible).toBe(true);
        expect(result.skipRecapNotVisible).toBe(false);
        expect(result.skipIntroVisible).toBe(true);
        expect(result.skipIntroPauseAdVisible).toBe(true);
        expect(result.skipIntroNotVisible).toBe(false);
        expect(result.subtitleVisible).toBe(true);
        expect(result.subtitlePauseAdVisible).toBe(true);
        expect(result.subtitleMenuHiddenAfterPause).toBe(false);
    });

    test('@Medium @mWeb IW3-T4019: Verify that "Mid-roll" ads are displayed on playing the content in full screen', async ({ page }) => {
        test.setTimeout(210000);
        const data = testCaseData['tc-ad-4019-mid-roll-ad-fullscreen'];
        const result = await verifyMidRollAdFullscreenFlow(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.fullscreenActive).toBe(true);
        expect(result.midRollAdVisible).toBe(true);
        expect(result.midRollAdInFullScreen).toBe(true);
    });

    test('@High @mWeb IW3-T2135: Verify Sponsored Rail is Displayed on Home, Shows, Movies, GMA pages. mWeb', async ({ page }) => {
        test.setTimeout(300000);
        const data = testCaseData['tc-ad-2135-sponsored-rail-visibility'];
        const result = await verifySponsoredRailVisibility(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabSponsoredRailVisible).toBe(true);
        expect(result.sponsoredRailVisible).toBe(true);
    });

    test('@High @mWeb IW3-T2137: Verify Advertiser logo is displayed on Sponsored Rails configured by CMS. mWeb', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-2137-sponsored-rail-advertiser-logo'];
        const result = await verifySponsoredRailAdvertiserLogo(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.sponsoredRailVisible).toBe(true);
        expect(result.advertiserLogoVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T2149: Verify Sponsored Rail content navigates to the respective details page. mWeb', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-2149-sponsored-rail-content-details-navigation'];
        const result = await verifySponsoredRailContentDetailsNavigation(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.sponsoredRailVisible).toBe(true);
        expect(result.contentCardClicked).toBe(true);
        expect(result.detailsPageVisible).toBe(true);
        expect(result.cardTitle).toBeTruthy();
        expect(result.detailPageTitle).toBeTruthy();
        expect(result.detailPageMetadata).toBeTruthy();
        expect(result.titlesMatch).toBe(true);
    });

    test('@High @mWeb IW3-T2146: Verify that Sponsored Rail is non-clickable/tappable except the content cards. mWeb', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-ad-2146-sponsored-rail-non-clickable'];
        const result = await verifySponsoredRailNonClickability(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.sponsoredRailVisible).toBe(true);
        expect(result.clickOnRailExecuted).toBe(true);
        expect(result.pageDidNotNavigate).toBe(true);
    });
});
