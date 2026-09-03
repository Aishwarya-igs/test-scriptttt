import { test, expect } from '../../src/fixtures/test-hooks';
import { validateContinueWatchingForNoHistory, verifyContinueWatchingRemovalAfterPlayback, verifyContinueWatchingRemoveItem, verifyContinueWatchingTrayScroll, verifyContinueWatchingTrayUI } from '../../src/businessFunction/ott-auth-bfs';
import { verifyContinueWatchingAcrossTabs, verifyContinueWatchingDetailsAndMoreNavigation, verifyContinueWatchingPlaybackFromTray, verifyContinueWatchingResumePlayback, verifyContinueWatchingTrayPersistence, verifyResumeCtaOnContentDetailsPage, verifyContinueWatchingTrayForNewUserAfterFivePercentPlayback, verifyContinueWatchingTrayForNewUserAfterLessThanFivePercentPlayback, verifyContinueWatchingTrayAfterFiftyPercentPlayback, verifyContentUpdatedInContinueWatchingTray, verifyClickUpNextBingeMarkerFromContinueWatching, verifyNextSeasonFirstEpisodeAutoPlayFlow, verifyContinueWatchingFreeUserAdResumePlayback, verifyLatestWatchedSeasonEpisodeInContinueWatchingTray, verifyContinueWatchingSeasonEpisodeUpdateAfterNextSeasonPlayback, verifyResumeToPlayAfterRemovingFromContinueWatching, verifyContinueWatchingShowsFreeAndPaidContent, verifyContinueWatchingSubscriptionPrompt, verifyShowContentRemovalFromContinueWatching, verifyUpNextBingeMarkerFromContinueWatching } from '../../src/businessFunction/ott-continue-watching-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Continue Watching - No Watch History', () => {

    test('@High IW3-T1926: Verify the Continue Watching tray for the new user.', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-009-continue-watching-no-history'];
        const result = await validateContinueWatchingForNoHistory(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@High IW3-T1927: Verify the Continue Watching tray on the Home Page for new users after watching 5% of the content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-027-continue-watching-five-percent'] as { mode?: string };
        const result = await verifyContinueWatchingTrayForNewUserAfterFivePercentPlayback(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.contentAppearsInTray).toBeTruthy();
    });

    test('@Medium IW3-T1928: Verify the Continue Watching tray on the Home Page for new users upon watching less than 5% of the content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-029-continue-watching-less-than-five-percent'] as { mode?: string};
        const result = await verifyContinueWatchingTrayForNewUserAfterLessThanFivePercentPlayback(page, { mode: data?.mode, });
        expect(result.isValid).toBeTruthy();
        expect(result.contentAppearsInTray).toBeFalsy();
    });

    test('@Medium IW3-T1929: Verify the Continue Watching tray upon watching 50% of the content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-028-continue-watching-fifty-percent'] as { mode?: string };
        const result = await verifyContinueWatchingTrayAfterFiftyPercentPlayback(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.contentAppearsInTray).toBeTruthy();
        expect(result.progressPercentageValid).toBeTruthy();
    });


    test('@Medium IW3-T1930: Verify that latest watched episode/movie of a season gets updated in the Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-cw-1930-latest-watched-episode'] as { mode?: string; expectedSeasonNumber?: string; expectedEpisodeNumber?: string };
        const result = await verifyLatestWatchedSeasonEpisodeInContinueWatchingTray(page, {
            mode: data?.mode,
            expectedSeasonNumber: data?.expectedSeasonNumber,
            expectedEpisodeNumber: data?.expectedEpisodeNumber,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.itemFound).toBeTruthy();
        expect(result.progressBarVisible).toBeTruthy();
        expect(result.seasonEpisodeVisible).toBeTruthy();
    });

    test('@High IW3-T1931: Verify the Continue Watching tray for logged-in user with no watch history', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-009-continue-watching-no-history'];
        const result = await validateContinueWatchingForNoHistory(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1932: Verify the UI/UX of the Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-010-continue-watching-tray-ui'];
        const result = await verifyContinueWatchingTrayUI(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@Low IW3-T1933: Verify the scroll functionality for the contents under Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-011-continue-watching-tray-scroll'];
        const result = await verifyContinueWatchingTrayScroll(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
    });

    test('@High IW3-T1934: Verify the content playback from the Continue Watching tray', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-023-continue-watching-playback'] as { mode?: string };
        const result = await verifyContinueWatchingPlaybackFromTray(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.itemFound).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
    });

    test('@Medium IW3-T1935: Verify the Navigation on tapping 3 dots and "Details and More" option displayed on the CW tray bottom bar popup', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-auth-014-continue-watching-details-and-more'] as { mode?: string };
        const result = await verifyContinueWatchingDetailsAndMoreNavigation(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.detailsAndMoreVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
    });

    test('@High IW3-T1936: Verify the functionality of "Remove From Continue Watching" CTA displayed on the CW tray bottom bar popup from Home screen', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-012-continue-watching-remove-item'];
        const result = await verifyContinueWatchingRemoveItem(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.initialItemCount).toBeGreaterThan(0);
        expect(result.confirmationVisible).toBeTruthy();
    });

    test('@High IW3-T1937: Verify that "Resume" CTA turns to "Play" and the default season/episode are retained after removing content from Continue Watching', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-auth-030-continue-watching-resume-to-play-after-removal'] as { mode?: string; season?: string; episodeName?: string };
        const result = await verifyResumeToPlayAfterRemovingFromContinueWatching(page, {
            mode: data?.mode,
            season: data?.season,
            episodeName: data?.episodeName,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.playActionVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
        expect(result.defaultEpisodeRetained).toBeTruthy();
    });

    test('@Medium IW3-T1941: Verify that the content is updated in the Continue Watching (CW) tray when the user partially watches it', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-cw-1941-content-updated-in-tray'] as { mode?: string; seekMinutes?: number };
        const result = await verifyContentUpdatedInContinueWatchingTray(page, { mode: data?.mode, seekMinutes: data?.seekMinutes });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.contentRemainsInTray).toBeTruthy();
    });

    test('@Medium IW3-T1942: Verify that Ad gets played for the free user on resuming the content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-cw-1942-free-user-ad-resume'] as { mode?: string };
        const result = await verifyContinueWatchingFreeUserAdResumePlayback(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.adVisible).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
        expect(result.contentResumed).toBeTruthy();
    });

    test('@Medium IW3-T1945: Verify the content under Continue Watching tray upon watching the content from different tabs', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-024-continue-watching-across-tabs'] as { mode?: string; tabs?: string[] };
        const result = await verifyContinueWatchingAcrossTabs(page, { mode: data?.mode, tabs: data?.tabs });
        expect(result.isValid).toBeTruthy();
        expect(result.contentVisibleInTray).toBeTruthy();
    });

    test('@Medium IW3-T1946: Verify that the season number and episode number are updated after completing the last episode of the current season and partially playing an episode from the next season', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-cw-1946-season-episode-update'] as { mode?: string; seasonOneEpisode?: string; seasonOneSeekPosition?: number; seasonTwoSeekPosition?: number; expectedSeasonNumber?: string; expectedEpisodeNumber?: string };
        const result = await verifyContinueWatchingSeasonEpisodeUpdateAfterNextSeasonPlayback(page, {
            mode: data?.mode,
            seasonOneEpisode: data?.seasonOneEpisode,
            seasonOneSeekPosition: data?.seasonOneSeekPosition,
            seasonTwoSeekPosition: data?.seasonTwoSeekPosition,
            expectedSeasonNumber: data?.expectedSeasonNumber,
            expectedEpisodeNumber: data?.expectedEpisodeNumber,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.contentItemFound).toBeTruthy();
        expect(result.seasonEpisodeUpdated).toBeTruthy();
        expect(result.actualSeasonNumber).toBe(data?.expectedSeasonNumber?.replace(/\D/g, ''));
        expect(result.actualEpisodeNumber).toBe(data?.expectedEpisodeNumber?.replace(/\D/g, ''));
    });

    test('@Medium IW3-T1947: Verify that the subscription prompt appears when attempting to play a premium episode from the Continue Watching tray', async ({ page }) => {
        test.setTimeout(320000);
        const data = testCaseData['tc-cw-1947-continue-watching-subscription-prompt'] as { mode?: string };
        const result = await verifyContinueWatchingSubscriptionPrompt(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.premiumEpisodeFound).toBeTruthy();
        expect(result.subscriptionPromptVisible).toBeTruthy();
        expect(result.gateMessage.length).toBeGreaterThan(0);
    });

    test('@Medium IW3-T1948: Verify that the Continue Watching tray is displayed with content of all types (free and premium)', async ({ page }) => {
        const data = testCaseData['tc-cw-1948-free-and-paid-content'] as { mode?: string };
        const result = await verifyContinueWatchingShowsFreeAndPaidContent(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.freeContentPresent).toBeTruthy();
        expect(result.paidContentPresent).toBeTruthy();
        expect(result.itemCount).toBeGreaterThan(0);
    });

    test('@Medium IW3-T1951: Verify the Continue Watching tray upon logout and login with same account', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-014-continue-watching-persistence'];
        const result = await verifyContinueWatchingTrayPersistence(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.sameContentAfterRelogin).toBeTruthy();
    });

    test('@Medium IW3-T1954: Verify that the Up Next binge marker appears and the next episode plays automatically after the current episode ends when resuming content from the Continue Watching (CW) tray.', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-cw-1955-next-episode-playback'] as { mode?: string};
        const result = await verifyUpNextBingeMarkerFromContinueWatching(page, {
            mode: data?.mode,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.markerVisible).toBeTruthy();
        expect(result.autoPlaybackStarted).toBeTruthy();
        expect(result.episodeProgressionValid).toBeTruthy();
        expect(result.seasonProgressionValid).toBeTruthy();
    });

    test('@Medium IW3-T1955: Verify "Next Episode" starts playing post tapping on "Next Episode" CTA.', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-cw-1955-next-episode-playback'] as { mode?: string };
        const result = await verifyClickUpNextBingeMarkerFromContinueWatching(page, {
            mode: data?.mode,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.markerVisible).toBeTruthy();
        expect(result.autoPlaybackStarted).toBeTruthy();
        expect(result.episodeProgressionValid).toBeTruthy();
        expect(result.seasonProgressionValid).toBeTruthy();
    });

    test('@High IW3-T1956 - Verify next season first episode starts playing automatically upon completing last episode of the first season', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-sub-046-iw3-t1956-next-season-autoplay'] as Record<string, any>;
        const result = await verifyNextSeasonFirstEpisodeAutoPlayFlow(page, {
            mode: data.mode,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.markerVisible).toBeTruthy();
        expect(result.autoPlaybackStarted).toBeTruthy();
        expect(result.episodeProgressionValid).toBeTruthy();
        expect(result.seasonProgressionValid).toBeTruthy();
    });

    test('@Medium IW3-T1958: Verify that "Resume" CTA is displayed inside the details screen for the partially watched contents', async ({ page }) => {
        const data = testCaseData['tc-auth-025-continue-watching-resume-cta'] as { mode?: string };
        const result = await verifyResumeCtaOnContentDetailsPage(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.resumeCtaVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
    });

    test('@Medium IW3-T1959: Verify that content gets resumed on tapping "Resume" CTA', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-026-continue-watching-resume-playback'] as { mode?: string };
        const result = await verifyContinueWatchingResumePlayback(page, { mode: data?.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.resumeActionVisible).toBeTruthy();
        expect(result.detailsPageVisible).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
    });

    test('@High IW3-T1960: Verify that movie content gets removed from CW tray post completely watching the same content', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-013-continue-watching-removal-after-playback'];
        const result = await verifyContinueWatchingRemovalAfterPlayback(page, { mode: data.mode });
        expect(result.isValid).toBeTruthy();
        expect(result.removedItemTitle).toBeTruthy();
        expect(result.initiallyVisible).toBeTruthy();
        expect(result.finallyVisible).toBeFalsy();
    });

    test('@High IW3-T1961: Verify that show content gets removed from CW tray after completely watching the show content', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-cw-1961-show-removal'] as { mode?: string };
        const result = await verifyShowContentRemovalFromContinueWatching(page, {
            mode: data?.mode,
        });
        expect(result.isValid).toBeTruthy();
        expect(result.initialVisibility).toBeTruthy();
        expect(result.finalVisibility).toBeFalsy();
    });

    test('@Low IW3-T1964: Verify the content from the CW tray when user partially watches the content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-cw-1941-content-updated-in-tray'] as { mode?: string; seekMinutes?: number };
        const result = await verifyContentUpdatedInContinueWatchingTray(page, { mode: data?.mode, seekMinutes: data?.seekMinutes });
        expect(result.isValid).toBeTruthy();
        expect(result.trayVisible).toBeTruthy();
        expect(result.contentRemainsInTray).toBeTruthy();
    });

});
