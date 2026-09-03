import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithInvalidCredentials, loginToOTT, loginWithMobileNumber, navigateToForgotPassword, submitForgotPasswordEmail, submitForgotPasswordMobileNumber, verifyWelcomeScreenUI, navigateAndVerifyTabs, verifySupportAndPolicyLinks, verifyApplicationVersion, navigateToTermsAndConditionsSection, searchFromTermsPage, verifyTermsPageDetails } from '../../src/businessFunction/ott-auth-bfs';
import { playFreeAsset } from '../../src/businessFunction/ott-playback-bfs.js'
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Home Page Launch', () => {

    test ('@Low IW3-T1859: Verify the message displayed on entering invalid credentials during login', async ({ page }) => {
        const data = testCaseData['tc-auth-001-invalid-credentials'];
        const result = await loginWithInvalidCredentials(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(false);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
    });

    test ('@High IW3-T1860: Verify the navigation on tapping Forgot Password? option', async ({ page }) => {
        const data = testCaseData['tc-auth-002-forgot-password'];
        const result = await navigateToForgotPassword(page, { expectedHeading: data.expectedHeading });
        expect(result.isVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
    });

    test ('@Medium IW3-T1861: Verify the navigation on entering Email and tapping Proceed button on the Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-003-forgot-password-proceed'];
        const result = await submitForgotPasswordEmail(page, {
            email: data.email,
            expectedOTPIdentity: data.expectedOTPIdentity
        });
        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpIdentityText).toBe(data.expectedOTPIdentity);
    });
 
    test ('@Medium IW3-T1864: Verify the message displayed on entering the mobile number on Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-004-forgot-password-mobile'];
        const result = await submitForgotPasswordMobileNumber(page, {
            mobileNumber: data.mobileNumber,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isMobileErrorDisplayed).toBe(true);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
    });

    test ('@Medium IW3-T1865: Verify the mobile number login functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-008-mobile-login'];
        const result = await loginWithMobileNumber(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test ('@Medium IW3-T1869: Verify the UI/UX of the Welcome to iWant screen for PH region', async ({ page }) => {
        const data = testCaseData['tc-auth-005-welcome-ui'];
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedSubheading: data.expectedSubheading,
        });
        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
        expect(result.isSubheadingVisible).toBe(true);
        expect(result.subheadingText).toContain(data.expectedSubheading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isLoginWithFacebookVisible).toBe(true);
        expect(result.isLoginWithTVProviderVisible).toBe(true);
        expect(result.isNewHereLinkVisible).toBe(true);
        expect(result.isCreateAccountLinkVisible).toBe(true);
    });

    test('@Medium IW3-T1880: Verify smooth navigation between Home, Shows, Movies, GMA, Search, and Profile icons', async ({ page }) => {
        const data = testCaseData['tc-auth-007-navigate-tabs'];
        const result = await navigateAndVerifyTabs({
                page, input: {
                    mode: data.mode,
                    expectedSearchPlaceholder: data.expectedSearchPlaceholder,
                }
            });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeRailVisible).toBe(true);
        expect(result.moviesRailVisible).toBe(true);
        expect(result.showsRailVisible).toBe(true);
        expect(result.watchlistRailVisible).toBe(true);
        expect(result.gmaRailVisible).toBe(true);
            if (process.env.BROWSER !== 'mchrome') {
                expect(result.searchBarPlaceholderMatches).toBe(true);
                expect(result.searchBarPlaceholder).toContain(data.expectedSearchPlaceholder);
            }
        expect(result.signOutOptionVisible).toBe(true);
    });

    test ('@High IW3-T4332: Verify that Welcome to iWant, Terms and Conditions, Cookie Policy, and Privacy Policy pages are displayed when the user taps their respective links', async ({ page }) => {
        test.setTimeout(60000)
        const data = testCaseData['tc-auth-009-help-support-links'];
        const result = await verifySupportAndPolicyLinks(page, {
            mode: data.mode,
            expectedHelpAndSupportHeading: data.expectedHelpAndSupportHeading,
            expectedTermsHeading: data.expectedTermsHeading,
            expectedPrivacyHeading: data.expectedPrivacyHeading,
            expectedCookieHeading: data.expectedCookieHeading,
        });
        expect(result.isLoggedIn).toBe(true);
        expect(result.helpAndSupportPageVisible).toBe(true);
        expect(result.termsPageVisible).toBe(true);
        expect(result.privacyPageVisible).toBe(true);
        expect(result.cookiePageVisible).toBe(true);
        expect(result.allPagesAccessible).toBe(true);
    });

    test ('@High IW3-T4333: Verify user is able to navigate to any section from the left navigation menu on the Terms and Conditions page', async ({ page }) => {
        const data = testCaseData['tc-auth-010-terms-navigation'];
        const result = await navigateToTermsAndConditionsSection(page, {
            mode: data.mode,
            subHeadingName: data.subModuleName,
            sectionLinkText: data.sectionLinkText,
            expectedUrlPart: data.expectedUrlPart,
            expectedHeading: data.expectedHeading,
        });
        expect(result.sectionPageVisible).toBe(true);
        expect(result.currentUrl).toContain(data.expectedUrlPart);
    });

    test ('@High IW3-T4334: Verify that the corresponding page details are displayed when the user taps any link from the Terms and Conditions page', async ({ page }) => {
        const data = testCaseData['tc-auth-012-terms-page-details'];
        const result = await verifyTermsPageDetails(page, {
            mode: data.mode,
            subHeadingName: data.subModuleName,
            sectionLinkText: data.sectionLinkText,
            expectedUrlPart: data.expectedUrlPart,
            expectedHeading: data.expectedHeading,
        });
        expect(result.pageDetailsVisible).toBe(true);
        expect(result.currentUrl).toContain(data.expectedUrlPart);
    });

    test ('@High IW3-T4337: Verify that the user is able to search any page via the search field from the Terms and Conditions page', async ({ page }) => {
        const data = testCaseData['tc-auth-011-terms-search'];
        const result = await searchFromTermsPage(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.searchResultsDisplayed).toBe(data.expectedResultsPresent);
    });

    test ('@High @mWeb IW3-T4335: Verify application version will be displayed at the bottom of the page', async ({ page }) => {
        test.setTimeout(90000)
        const data = testCaseData['tc-auth-016-application-version'];
        const result = await verifyApplicationVersion(page, {
            mode: data.mode,
            expectedTermsHeading: data.expectedTermsHeading,
        });
        expect(result.termsPageVisible).toBe(true);
        expect(result.versionDisplayed).toBe(true);
    });

    test ('@High @mWeb IW3-T4338: Verify search result will be displayed based on the search input text', async ({ page }) => {
        const data = testCaseData['tc-auth-013-terms-search-results'];
        const result = await searchFromTermsPage(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.searchResultsDisplayed).toBe(data.expectedResultsPresent);
        expect(result.searchResultsVisible).toBe(true);
    });

    test ('@High IW3-T4339: Verify that the respective page is displayed when the user taps any link in the Introduction page', async ({ page }) => {
        const data = testCaseData['tc-auth-014-terms-introduction'];
        const result = await navigateToTermsAndConditionsSection(page, {
            mode: data.mode,
            subHeadingName: data.subModuleName,
            sectionLinkText: data.sectionLinkText,
            expectedUrlPart: data.expectedUrlPart,
            expectedHeading: data.expectedHeading,
        });
        expect(result.sectionPageVisible).toBe(true);
        expect(result.currentUrl).toContain(data.expectedUrlPart);
    });

    test ('@High IW3-T4341: Verify that the respective page is displayed when the user taps any link on the Terms and Conditions page', async ({ page }) => {
        const data = testCaseData['tc-auth-015-terms-page-links'];
        const result = await navigateToTermsAndConditionsSection(page, {
            mode: data.mode,
            subHeadingName: data.subModuleName,
            sectionLinkText: data.sectionLinkText,
            expectedUrlPart: data.expectedUrlPart,
            expectedHeading: data.expectedHeading,
        });
        expect(result.sectionPageVisible).toBe(true);
        expect(result.currentUrl).toContain(data.expectedUrlPart);
    });

    test  ('IW3-T1870: Verify user is able to login with valid credentials', async ({ page }) => {
        const data = testCaseData['tc-auth-006-valid-login'];
        const result = await loginToOTT(page, { mode: data.mode });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test ('@High @mWeb IW3-T1871: Verify the content starts playing on tapping the Play button for a free asset', async ({ page }) => {
        test.setTimeout(120000);
        const data = testCaseData['tc-play-001-free-asset-playback'];
        const result = await playFreeAsset(page, { mode: data.mode });
        expect(result.isLoggedIn).toBe(true);
        expect(result.isPlayableContentDetected).toBe(true);
        expect(result.playAttempted).toBe(true);
        expect(result.playbackStarted).toBe(true);
    });
});
