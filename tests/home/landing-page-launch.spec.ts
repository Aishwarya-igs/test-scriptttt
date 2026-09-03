import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithTVProvider, verifyMidRailAds, verifyTop10TagOnContentThumbnail, verifyMidRailAdAutoRefresh,verifyWelcomeIntroductionPagePagination, navigateAndVerifyTabs } from '../../src/businessFunction/ott-auth-bfs';
import { verifyMidRailAdSpacingAcrossTabs } from '../../src/businessFunction/ott-playback-bfs';
import { navigateToMovieDetailsFromLandingPage, verifyDetailsPageFromCarouselInfoIcon, verifyLandingPageUI, verifySubscriptionPageFromCarouselSubscribeCta } from '../../src/businessFunction/ott-landing-bfs';
import { verifyBecauseYouWatchedRail, verifyBecauseYouWatchedRailGenreUpdate, verifyLandingPageRelatedContentTraysOutsidePH, verifyMidRailBannerAdlRefresh, verifyMidRailBannerAdlVisibility, verifyTop10TagOnSearchResults, verifyTop10TagOnWatchlist } from '../../src/businessFunction/ott-landing-bfs';
import { verifyMidRailBannerGoogleAds } from '../../src/businessFunction/ott-landing-bfs';
import { OTTAuthPage } from '../../src/pom/OTTAuthPage';
import { OTTDetailsPage } from '../../src/pom/OTTDetailsPage';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyEarlyAccessPlaybackFlowFromGraphQL } from '../../src/businessFunction/ott-early-access-bfs';
import {verifyBackNavigationFromDetailsPage} from '../../src/businessFunction/ott-details-bfs';

test.describe('Home Page Landing', () => {
    test('@Medium IW3-T1879: Verify the UI of all the landing pages', async ({ page }) => {
        const data = testCaseData['tc-auth-040-landing-page-ui'];
        const result = await verifyLandingPageUI(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.logoVisible).toBe(true);
        expect(result.searchIconVisible).toBe(true);
        expect(result.homeTabSelected).toBe(true);
        expect(result.moviesTabSelected).toBe(true);
        expect(result.showsTabSelected).toBe(true);
        expect(result.watchlistTabSelected).toBe(true);
        expect(result.gmaTabSelected).toBe(true);
        expect(result.allLandingPagesValid).toBe(true);
    });
    test('@Medium IW3-T1880: Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons', async ({ page }) => {
        const data = testCaseData['tc-auth-007-navigate-tabs'];
        const result = await navigateAndVerifyTabs(page, {
            mode: data.mode,
            expectedSearchPlaceholder: data.expectedSearchPlaceholder,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeRailVisible).toBe(true);
        expect(result.moviesRailVisible).toBe(true);
        expect(result.showsRailVisible).toBe(true);
        expect(result.watchlistRailVisible).toBe(true);
        expect(result.gmaRailVisible).toBe(true);
        expect(result.searchBarPlaceholderMatches).toBe(true);
        expect(result.searchBarPlaceholder).toContain(data.expectedSearchPlaceholder);
        expect(result.signOutOptionVisible).toBe(true);
    });

    test('@High IW3-T2129: Verify mid rail banner ads are from GAM', async ({ page }) => {
        const data = testCaseData['tc-ad-002-mid-rail-gam'] as Record<string, any>;
        const result = await verifyMidRailAds(page, {
        mode: data.mode,
        expectedAdHost: data.expectedAdHost,
        });
        expect(result.adElementVisible).toBe(true);
        expect(result.adRequestsFound).toBe(true);
        expect(result.matchedUrls.length).toBeGreaterThan(0);
    });

    test('@High - IW3-T2133: Verify Mid rail Ad banner auto refreshes after every 30 sec', async ({ page }) => {
        test.setTimeout(200000);
        const data = testCaseData['tc-ad-003-mid-rail-refresh'] as Record<string, any>;
        const result = await verifyMidRailAdAutoRefresh(page, {
            mode: data.mode,
            expectedAdHost: data.expectedAdHost,
            refreshWindowMs: data.refreshWindowMs,
            minimumRefreshRequests: data.minimumRefreshRequests,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.tabResults.length).toBe(3);
        for (const tabResult of result.tabResults) {
            expect(tabResult.adVisible).toBe(true);
            expect(tabResult.refreshObserved).toBe(true);
            expect(tabResult.finalRequestCount).toBeGreaterThanOrEqual(tabResult.initialRequestCount + data.minimumRefreshRequests);
        }
        expect(result.refreshObserved).toBe(true);
    });

    test('@High - IW3-T4703: Verify the "Top 10" tag on content thumbnails across home rails', async ({ page }) => {
        const data = testCaseData['tc-home-top10-tag'];
        const result = await verifyTop10TagOnContentThumbnail(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.top10Titles.length).toBeGreaterThan(0);
        expect(result.matchedCount).toBeGreaterThan(0);
    });

    test('@High - IW3-T4704: Verify the "Top 10" tag is displayed at the top-right corner of the content thumbnail', async ({ page }) => {
        const data = testCaseData['tc-home-top10-tag'];
        const result = await verifyTop10TagOnContentThumbnail(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.top10Titles.length).toBeGreaterThan(0);
        expect(result.matchedRails.some((entry) => entry.hasTop10Tag && entry.isTopRightPosition)).toBe(true);
        expect(result.topRightPositionMatches).toBeGreaterThan(0);
    });
    
    test('@High - IW3-T2132: Verify the spacing between the contents and other rails post configuring the Mid rail banner Ad', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-ad-001-mid-rail-spacing'];
        const result = await verifyMidRailAdSpacingAcrossTabs(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeSpacingValid).toBe(true);
        expect(result.moviesSpacingValid).toBe(true);
        expect(result.showsSpacingValid).toBe(true);
    });

    test('@Medium @mWeb IW3-T1890: Verify that the details page is displayed upon clicking the info icon in the carousel', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-026-info-icon-carousel'];
        const result = await verifyDetailsPageFromCarouselInfoIcon(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isDetailsPageVisible).toBe(true);
        expect(result.isContentMetadataVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T1894: Verify that the subscription page is displayed when a logged-in free user taps the "Subscribe to Watch" CTA from the carousel', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-027-carousel-subscribe-cta'];
        const result = await verifySubscriptionPageFromCarouselSubscribeCta(page, {
            mode: data.mode,
            searchText: data.searchText,
            contentTitle: data.contentTitle,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isSubscriptionBlockerVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T1887: Verify that the user is navigated to the content details page when selecting any content from the Movies tab', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-028-movie-details-from-movies-rail'];
        const result = await navigateToMovieDetailsFromLandingPage(page, {
            mode: data.mode  
        });
        expect(result.isDetailsPageVisible).toBe(true);
        expect(result.isContentMetadataVisible).toBe(true);
    });

    test('@High @mWeb IW3-T3669: Verify that subscribed users with Premium Monthly plans can watch Early Access episodes', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-discovery-002-early-access-premium-monthly'];
        const result = await verifyEarlyAccessPlaybackFlowFromGraphQL(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            labelText: data.labelText, 
        });
        expect(result.earlyAccessTagVisible).toBeTruthy();
        expect(result.episodeClicked).toBeTruthy();
        expect(result.playbackStarted).toBe(true);
        expect(result.playerTitleVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T1888: Verify that the user navigates back to the previous page on tapping the back button from the details page', async ({ page }) => {
        test.setTimeout(180000);
        const data = testCaseData['tc-auth-034-details-page-back-navigation'];
        const result = await verifyBackNavigationFromDetailsPage(page, {
            mode: data.mode,
            query: data.query
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.detailsPageVisibleBeforeBack).toBe(true);
        expect(result.detailsPageVisibleAfterBack).toBe(false);
        expect(result.previousPageVisible).toBe(true);
    });

    test('@Medium IW3-T4340: Verify Next and Previous page will be displayed when user click on Previous/Next link in Welcome / Introduction page', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-035-welcome-introduction-pagination'];
        const result = await verifyWelcomeIntroductionPagePagination(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.termsPageVisible).toBe(true);
        expect(result.nextPageVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T4705: Verify that "Top 10" tag is displayed on the content thumbnail when searching the Top 10 rail content', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-031-top-10-tag-on-search'];
        const result = await verifyTop10TagOnSearchResults(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.top10TagVisible).toBe(true);
        expect(result.tagPositionedOnTopRight).toBe(true);
    });

    test('@Medium  IW3-T4706: Verify that "Top 10" tag is displayed on the content thumbnail when Top 10 rail content is added to Watchlist', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-auth-032-top-10-tag-on-watchlist'];
        const result = await verifyTop10TagOnWatchlist(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.addedToWatchlist).toBe(true);
        expect(result.isVisibleInMyWatchlist).toBe(true);
        expect(result.top10TagVisible).toBe(true);
    });

    test('@Medium @mWeb IW3-T1886: Verify that related content and trays are displayed under Shows, Movies, and GMA (only outside the Philippines)', async ({ page }) => {
        const data = testCaseData['tc-auth-033-related-content-trays-outside-ph'];
        const result = await verifyLandingPageRelatedContentTraysOutsidePH(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.moviesTrayVisible).toBe(true);
        expect(result.showsTrayVisible).toBe(true);
        expect(result.gmaMetadataVisible).toBe(true);
        expect(result.isValid).toBe(true);
    });

    test('@Medium IW3-T4658: Verify that “Because You Watched {Movie Title/Show Title}” rail created on the Home page post watching the content with >95% completion.', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-039-because-you-watched-genre-update'];
        const result = await verifyBecauseYouWatchedRailGenreUpdate(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.headingVisible).toBe(true);
        expect(result.railVisible).toBe(true);
        expect(result.secondGenre).toBeTruthy();
        expect(result.railFirstItemGenre).toBeTruthy();
        expect(result.railFirstItemGenre.trim().toLowerCase()).toBe(result.secondGenre.trim().toLowerCase());
        expect(result.genreUpdated).toBe(true);
    });

    test('@Medium IW3-T4659: Verify that the "Because You Watched {Movie Title/Show Title}" rail displays movies/shows belonging to the same genre as the watched content', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-036-because-you-watched-rail'];
        const result = await verifyBecauseYouWatchedRail(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.railVisible).toBe(true);
        expect(result.metadataMatches).toBe(true);
    });

    test('@Medium IW3-T4660: Verify that the "Because You Watched {Movie Title/Show Title}" rail updates dynamically when the user watches a movie from a different genre', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-039-because-you-watched-genre-update'];
        const result = await verifyBecauseYouWatchedRailGenreUpdate(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.headingVisible).toBe(true);
        expect(result.railVisible).toBe(true);
        expect(result.secondGenre).toBeTruthy();
        expect(result.railFirstItemGenre).toBeTruthy();
        expect(result.railFirstItemGenre.trim().toLowerCase()).toBe(result.secondGenre.trim().toLowerCase());
        expect(result.genreUpdated).toBe(true);
    });
    test('@High IW3-T2127: Verify Mid rail banner Adl is Displayed on Home, Shows, Movies, GMA, Search pages', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-037-mid-rail-banner-adl'];
        const result = await verifyMidRailBannerAdlVisibility(page, {
            mode: data.mode,
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.allPagesVisible).toBe(true);
    });
    test('@Medium IW3-T2130: Verify Mid rail banner Adl is Displayed on Home, Shows, Movies, GMA, Search pages', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-037-mid-rail-banner-adl'];
        const result = await verifyMidRailBannerAdlVisibility(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.allPagesVisible).toBe(true);
    });

    test('@Medium IW3-T2128: Verify Mid rail banner ad loads without any issues on page refresh', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-038-mid-rail-banner-adl-refresh'];
        const result = await verifyMidRailBannerAdlRefresh(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.initialHomeBannerVisible).toBe(true);
        expect(result.initialMoviesBannerVisible).toBe(true);
        expect(result.initialShowsBannerVisible).toBe(true);
        expect(result.postRefreshHomeBannerVisible).toBe(true);
        expect(result.postRefreshMoviesBannerVisible).toBe(true);
        expect(result.postRefreshShowsBannerVisible).toBe(true);
        expect(result.allPagesVisibleAfterRefresh).toBe(true);
    });
});
