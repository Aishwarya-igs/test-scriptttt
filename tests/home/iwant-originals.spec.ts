import { test, expect } from '../../src/fixtures/test-hooks';
import {
    verifyIWantOriginalsRail,
    verifyIWantOriginalsRailScrollability,
    verifyIWantOriginalsHoverPreview,
} from '../../src/businessFunction/ott-auth-bfs';
import { verifyIWantOriginalsPreviewOnDetailsPage } from '../../src/businessFunction/ott-details-bfs';
import testData from '../../src/data/ott-test-cases.json';

test.describe('iWant Originals Rail', () => {
    test('@medium @mWeb IW3-T5810: Verify iWant Originals Rail displayed on the Home page', async ({ page }) => {
        const data = testData['tc-home-001-iwant-originals-rail'];
        const result = await verifyIWantOriginalsRail(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homePageVisible).toBe(true);
        expect(result.railTitleVisible).toBe(true);
        expect(result.contentCardsCount).toBeGreaterThan(0);
    });

    test('@Medium @mWeb IW3-T5814: Verify that "iWant Originals" tray contents are scrollable on tapping right or left arrow mark', async ({ page }) => {
        const data = testData['tc-home-002-iwant-originals-rail-scroll'];
        const result = await verifyIWantOriginalsRailScrollability(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.railVisible).toBe(true);
        expect(result.contentCardsCount).toBeGreaterThan(0);
        expect(result.scrolledRight).toBe(true);
        expect(result.scrolledLeft).toBe(true);
    });

    test('@Medium IW3-T5812: Verify preview playback starts on Mouse hover on the content thumbnail under iWant Originals content', async ({ page }) => {
        const data = testData['tc-home-003-iwant-originals-hover-preview'];
        const result = await verifyIWantOriginalsHoverPreview(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.railVisible).toBe(true);
        expect(result.firstCardVisible).toBe(true);
        expect(result.previewStarted).toBe(true);
    });

    test('@medium IW3-T5813: Verify preview playback on Content Detail Page when user selects the content from the iWant Originals tray', async ({ page }) => {
        test.setTimeout(90000);
        const data = testData['tc-home-004-iwant-originals-preview-details'];
        const result = await verifyIWantOriginalsPreviewOnDetailsPage(page, {
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isDetailsPageVisible).toBe(true);
        expect(result.previewVideoVisible).toBe(true);
        expect(result.previewPlaybackStarted).toBe(true);
    });
});
