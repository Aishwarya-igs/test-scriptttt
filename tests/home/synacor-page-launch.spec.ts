import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithTVProvider, logoutFromOTT, verifySynacorProfileEditRestriction } from '../../src/businessFunction/ott-auth-bfs';
import { verifyContinueWatchingPlaybackIndependent, verifySynacorLandingPages } from '../../src/businessFunction/ott-continue-watching-independent-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Synacor Logout', () => {
    test ('@High IW3-T3657: Verify the user is able log in with any TV provider credentials', async ({ page }) => {
        const data = testCaseData['tc-auth-018-synacor-provider-login'];
        const result = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.moviesTabVisible).toBe(true);
    });

    test ('@High IW3-T3663: Verify Synacor user is able to logout from the application', async ({ page }) => {
        const data = testCaseData['tc-auth-016-synacor-logout'];
        const result = await logoutFromOTT(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(result.isLoggedOut).toBe(true);
        expect(result.welcomeScreenVisible).toBe(true);
    });

    test ('@High IW3-T3664: Verify Synacor user will not be able to edit the profile in account page', async ({ page }) => {
        test.setTimeout(50000)
        const data = testCaseData['tc-auth-017-synacor-profile-edit-restriction'];
        const loginResult = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        const result = await verifySynacorProfileEditRestriction(page, {
            providerName: data.providerName,
            mode: data.mode,
        });
        expect(loginResult.isLoggedIn).toBe(true);
        expect(result.isRestricted).toBe(true);
        expect(result.editProfileVisible).toBe(false);
    });

    test ('@High IW3-T3660: Verify partially watched content appears in Continue Watching tray', async ({ page }) => {
        test.setTimeout(200000);
        const data = testCaseData['tc-auth-023-continue-watching-playback-synacor'];
        const result = await verifyContinueWatchingPlaybackIndependent(page, { mode: data?.mode, providerName: data?.providerName });
       
        expect(result.itemFound).toBeTruthy();
        expect(result.playerVisible).toBeTruthy();
        expect(result.progressObserved).toBeTruthy();
    });

    test('@High IW3-T3666: Verify landing pages display correctly post Synacor login', async ({ page }) => {
        test.setTimeout(60000);
        const data = testCaseData['tc-auth-025-synacor-landing-pages'];
        const result = await verifySynacorLandingPages(page, {
            mode: data?.mode,
            providerName: data?.providerName,
        });
        expect(result.isLoggedIn).toBeTruthy();
        expect(result.homeRailVisible).toBeTruthy();
        expect(result.moviesRailVisible).toBeTruthy();
        expect(result.showsRailVisible).toBeTruthy();
        expect(result.watchlistRailVisible).toBeTruthy();
        expect(result.gmaRailVisible).toBeTruthy();
        expect(result.searchBarPlaceholder.length).toBeGreaterThan(0);
        expect(result.searchBarPlaceholderMatches).toBeTruthy();
        expect(result.signOutOptionVisible).toBeTruthy();
    });

    
});