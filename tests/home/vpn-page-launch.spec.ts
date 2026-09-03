import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyVPNPlaybackRestriction, verifyVPNWhitelistedPlayback } from '../../src/businessFunction/ott-details-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { searchFromTermsPage, verifyApplicationVersion } from '../../src/businessFunction/ott-auth-bfs';

test.describe('VPN Playback Restriction', () => {
    test('@High IW3-T4699: Verify VPN playback restriction error message and prevent playback', async ({ page }) => {
        const data = testCaseData['tc-auth-019-vpn-playback-restriction'];
        const result = await verifyVPNPlaybackRestriction(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
            expectedVPNErrorMessage: data.expectedVPNErrorMessage,
            parentalPin: data.pin,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.vpnErrorVisible).toBe(true);
        expect(result.errorMessage).toBe(data.expectedVPNErrorMessage);
        expect(result.playbackStarted).toBe(false);
    });

    test('@High IW3-T4335: Verify application version will be displayed at the bottom of the page', async ({ page }) => {
        test.setTimeout(70000)
        const data = testCaseData['tc-auth-016-application-version'];
        const result = await verifyApplicationVersion(page, {
            mode: data.mode,
            expectedTermsHeading: data.expectedTermsHeading,
        });
        expect(result.termsPageVisible).toBe(true);
        expect(result.versionDisplayed).toBe(true);
    });
    test('@High IW3-T4337: Verify that the user is able to search any page via the search field from the Terms and Conditions page', async ({ page }) => {
        const data = testCaseData['tc-auth-011-terms-search'];
        const result = await searchFromTermsPage(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.searchResultsDisplayed).toBe(data.expectedResultsPresent);
    });
    test('@High @mWeb IW3-T4702 - Verify that contents are played for the VPN whitelisted countries', async ({ page }) => {
        test.setTimeout(90000);
        const data = testCaseData['tc-auth-020-vpn-whitelisted-playback'] as Record<string, any>;
        const result = await verifyVPNWhitelistedPlayback(page, {
        mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.detailsVisible).toBe(true);
        expect(result.playerVisible).toBe(true);
        expect(result.playbackStarted).toBe(true);
    });
});