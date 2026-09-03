import { test, expect } from '../../src/fixtures/test-hooks';
import { loginWithInvalidCredentials, loginToOTT, loginWithMobileNumber, navigateToForgotPassword, submitForgotPasswordEmail, submitForgotPasswordMobileNumber, verifyWelcomeScreenUI, navigateAndVerifyTabs, verifySupportAndPolicyLinks, verifyApplicationVersion, navigateToTermsAndConditionsSection, searchFromTermsPage, verifyTermsPageDetails } from '../../src/businessFunction/ott-auth-bfs';
import { playFreeAsset } from '../../src/businessFunction/ott-playback-bfs.js'
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Accounts and settings', () => {
    
    test('@High IW3-T4332: Verify that Welcome to iWant, Terms and Conditions, Cookie Policy, and Privacy Policy pages are displayed when the user taps their respective links', async ({ page }) => {
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

    test('@High IW3-T4333: Verify user is able to navigate to any section from the left navigation menu on the Terms and Conditions page', async ({ page }) => {
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

    test('@High IW3-T4334: Verify that the corresponding page details are displayed when the user taps any link from the Terms and Conditions page', async ({ page }) => {
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

    test('@High IW3-T4338: Verify search result will be displayed based on the search input text', async ({ page }) => {
        const data = testCaseData['tc-auth-013-terms-search-results'];
        const result = await searchFromTermsPage(page, {
            mode: data.mode,
            searchQuery: data.searchQuery,
        });
        expect(result.searchResultsDisplayed).toBe(data.expectedResultsPresent);
        expect(result.searchResultsVisible).toBe(true);
    });

    test('@High IW3-T4339: Verify that the respective page is displayed when the user taps any link in the Introduction page', async ({ page }) => {
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

    test('@High IW3-T4341: Verify that the respective page is displayed when the user taps any link on the Terms and Conditions page', async ({ page }) => {
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

    test('IW3-T1870: Verify user is able to login with valid credentials', async ({ page }) => {
        const data = testCaseData['tc-auth-006-valid-login'];
        const result = await loginToOTT(page, { mode: data.mode });
        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    
});
