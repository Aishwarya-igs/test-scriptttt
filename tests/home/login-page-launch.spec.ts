import { test, expect } from '../../src/fixtures/test-hooks'
import {
    verifyWelcomeScreenUI, loginWithInvalidCredentials, submitForgotPasswordMobileNumber, loginWithMobileNumber,
    submitUnregisteredUserLogin, verifyPasswordVisibilityToggle, verifyCreateAccountScreenUI, enterCreateAccountEmailOnly,
    verifyRegistrationNavigation, verifyRegistrationOTPScreen, verifyRegistrationNavigationToHomePage, submitEmptyCredentials,
    submitCreateAccountInvalidCredentials, submitForgotPasswordEmail, verifyForgotPasswordResetFlow, navigateToForgotPassword,
    verifyLoginWithNewPasswordCredentials, loginWithTVProvider, validateEditProfileNameFields, loginToOTT, verifyForgotPasswordOtpNavigation
} from '../../src/businessFunction/ott-auth-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { getRandomYopmailAddress } from '../../src/utils/yopmail-helper';
import { playFreeAsset } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Login and Registration Page Launch', () => {
    test('@high IW3-T1846: Verify that user navigates to "Welcome to iWant" screen on entering the URL from Non-PH region', async ({ page }) => {
        const data = testCaseData['tc-auth-009-welcome-screen-navigation'];
        const expectedHeading = data.expectedHeading;
        const expectedSubheading = data.expectedSubheading ?? '';
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading,
            expectedSubheading,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(expectedHeading);
    });


    test('@low IW3-T1847 Verify the UI/UX of the "Welcome to iWant" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-010-welcome-screen-ui'];
        const result = await verifyWelcomeScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedSubheading: data.expectedSubheading,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
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

    test('@High IW3-T1848: Verify the navigation on tapping of Create Account', async ({ page }) => {
        const data = testCaseData['tc-auth-006-create-account-ui'];
        const result = await verifyCreateAccountScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedEmailLabel: data.expectedEmailLabel,
            expectedPasswordLabel: data.expectedPasswordLabel,
            expectedTermsText: data.expectedTermsText,
            expectedMarketingText: data.expectedMarketingText,
            expectedContinueLabel: data.expectedContinueLabel,
            expectedLoginPrompt: data.expectedLoginPrompt,
            expectedLoginLinkText: data.expectedLoginLinkText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
    });

    test('@Low IW3-T1849: Verify the UI/UX of the Create an account screen', async ({ page }) => {
        const data = testCaseData['tc-auth-006-create-account-ui'];
        const result = await verifyCreateAccountScreenUI(page, {
            expectedHeading: data.expectedHeading,
            expectedEmailLabel: data.expectedEmailLabel,
            expectedPasswordLabel: data.expectedPasswordLabel,
            expectedTermsText: data.expectedTermsText,
            expectedMarketingText: data.expectedMarketingText,
            expectedContinueLabel: data.expectedContinueLabel,
            expectedLoginPrompt: data.expectedLoginPrompt,
            expectedLoginLinkText: data.expectedLoginLinkText,
        });
        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isAlreadyHaveAccountTextVisible).toBe(true);
        expect(result.isLoginLinkVisible).toBe(true);
    });

    test('@High IW3-T1850: Verify the functionality of entering email id in the "Let\'s Get Started" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-011-create-account-credentials'];
        const result = await enterCreateAccountEmailOnly(page, {
            email: data.email,
        });

        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.emailFieldValue).toBe(data.email);
    });

    test('@High IW3-T1852: Verify the navigation on entering a valid email and password on the "Let\'s Get Started" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-026-registration-navigation'];
        const result = await verifyRegistrationNavigation(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isConfirmPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.termsText).toContain(data.expectedTermsText);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.marketingText).toContain(data.expectedMarketingText);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.emailFieldValue).toBe(data.email);
        expect(result.passwordFieldValue).toBe(data.password);
        expect(result.confirmPasswordFieldValue).toBe(data.password);
        expect(result.isVerifyOTPPageVisible).toBe(true);
    });

    test('@High IW3-T1853: Verify the UI/UX of the "Verify Your Email" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-026-registration-navigation'];
        const result = await verifyRegistrationOTPScreen(page, {
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPMessagePrefix: data.expectedOTPMessagePrefix,
            expectedOTPInputText: data.expectedOTPInputText,
            expectedVerifyButtonText: data.expectedVerifyButtonText,
            expectedBackToLoginText: data.expectedBackToLoginText,
        });

        expect(result.isVerifyOTPPageVisible).toBe(true);
        expect(result.isVerifyOTPMessageVisible).toBe(true);
        expect(result.verifyOTPMessageText).toContain(data.expectedOTPMessagePrefix);
        expect(result.isVerifyOTPEmailVisible).toBe(true);
        expect(result.verifyOTPEmailText).toContain(data.email);
        expect(result.isInputCodeInstructionVisible).toBe(true);
        expect(result.inputCodeInstructionText).toContain(data.expectedOTPInputText);
        expect(result.isVerifyButtonVisible).toBe(true);
        expect(result.isBackToLoginLinkVisible).toBe(true);
    });


    test('@High IW3-T1854: Verify the navigation on entering a valid email and password on the "Let\'s Get Started" screen', async ({ page }) => {
        test.setTimeout(120000);
        const staticData = testCaseData['tc-auth-026-registration-navigation'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email }; // overrides the JSON's email field

        const result = await verifyRegistrationNavigationToHomePage(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
        });

        expect(result.isHeadingVisible).toBe(true);
        expect(result.headingText).toContain(data.expectedHeading);
        expect(result.isEmailFieldVisible).toBe(true);
        expect(result.isPasswordFieldVisible).toBe(true);
        expect(result.isConfirmPasswordFieldVisible).toBe(true);
        expect(result.isTermsCheckboxVisible).toBe(true);
        expect(result.termsText).toContain(data.expectedTermsText);
        expect(result.isMarketingCheckboxVisible).toBe(true);
        expect(result.marketingText).toContain(data.expectedMarketingText);
        expect(result.isContinueButtonVisible).toBe(true);
        expect(result.isGeneratedEmailVisibleOnAccountPage).toBe(true);
    });

    test('@High IW3-T1855: Verify the error message on entering invalid email/phone number and password on the Email text field on Get Started screen', async ({ page }) => {
        const data = testCaseData['tc-auth-012-create-account-invalid-credentials'];
        const result = await submitCreateAccountInvalidCredentials(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('@Low IW3-T1856: Verify error message is displayed when email and password fields are left empty', async ({ page }) => {
        const data = testCaseData['tc-auth-007-empty-credentials'];
        const result = await submitEmptyCredentials(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });


    test('@low IW3-T1857: Verify the message displayed when new user try to login without registration', async ({ page }) => {
        const data = testCaseData['tc-auth-013-unregistered-user-login'];
        const result = await submitUnregisteredUserLogin(page, {
            email: data.email,
            password: data.password,
            expectedErrorMessage: data.expectedErrorMessage,
        });

        expect(result.isErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
    });

    test('IW3-T1865: Verify the mobile number login functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-008-mobile-login'];
        const result = await loginWithMobileNumber(page, {
            mode: 'mobile',
        });

        expect(result.isLoggedIn).toBe(true);
        expect(result.homeTabVisible).toBe(true);
    });

    test('@Low  IW3-T1858: Verify the password visibility toggle', async ({ page }) => {
        const data = testCaseData['tc-auth-014-password-visibility-toggle'];
        const result = await verifyPasswordVisibilityToggle(page, {
            email: data.email,
            password: data.password,
        });
        expect(result.initialPasswordType).toBe('password');
        expect(result.afterTogglePasswordType).toBe('text');
        expect(result.isPasswordTextVisible).toBe(true);
    });

    test('@Low IW3-T1859: Verify the message displayed on entering invalid credentials during login', async ({ page }) => {
        const data = testCaseData['tc-auth-001-invalid-credentials'];
        const result = await loginWithInvalidCredentials(page, {
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(false);
        expect(result.errorMessage).toBe(data.expectedErrorMessage);
    });
    test('@High IW3-T1860: Verify the navigation on tapping Forgot Password? option', async ({ page }) => {
        const data = testCaseData['tc-auth-002-forgot-password'];
        const result = await navigateToForgotPassword(page, { expectedHeading: data.expectedHeading });
        expect(result.isVisible).toBe(true);
        expect(result.headingText).toBe(data.expectedHeading);
    });

    test('@Medium IW3-T1861: Verify the navigation on entering Email and tapping Proceed button on the Forgot Password? screen', async ({ page }) => {
        const data = testCaseData['tc-auth-003-forgot-password-proceed'];
        const result = await submitForgotPasswordEmail(page, {
            email: data.email,
            expectedOTPHeading: data.expectedOTPHeading,
        });
        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toBe(data.expectedOTPHeading);
    });

    test('@Medium IW3-T1862: Verify the navigation on entering OTP for the forgot password', async ({ page }) => {
        test.setTimeout(180000);
        const staticData = testCaseData['tc-auth-020-forgot-password-otp'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email }; // overrides the JSON's email field

        const result = await verifyForgotPasswordOtpNavigation(page, {
            email: data.email,
            password: data.password,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toContain(data.expectedOTPHeading);
        expect(result.isSetNewPasswordScreenVisible).toBe(true);
        expect(result.setNewPasswordHeadingText).toContain(data.expectedNewPasswordHeading);
    });

    test('@Medium IW3-T1863: Verify the UI/UX and "Forgot Password" functionality popup', async ({ page }) => {
        test.setTimeout(300000);
        const staticData = testCaseData['tc-auth-021-forgot-password-reset-popup'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email };

        const result = await verifyForgotPasswordResetFlow(page, {
            email: data.email,
            password: data.password,
            newPassword: data.newPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
            expectedSuccessMessage: data.expectedSuccessMessage,
        });

        expect(result.isOTPPageVisible).toBe(true);
        expect(result.otpHeadingText).toContain(data.expectedOTPHeading);
        expect(result.isSetNewPasswordScreenVisible).toBe(true);
        expect(result.setNewPasswordHeadingText).toContain(data.expectedNewPasswordHeading);
        expect(result.isSuccessPopupVisible).toBe(true);
        expect(result.successMessageText).toContain(data.expectedSuccessMessage);
        expect(result.isLoginScreenVisible).toBe(true);
    });

    test('IW3-T1864: Verify the message displayed on entering the mobile number on "Forgot Password?" screen', async ({ page }) => {
        const data = testCaseData['tc-auth-004-forgot-password-mobile'];
        const result = await submitForgotPasswordMobileNumber(page, {
            mobileNumber: data.mobileNumber,
            expectedErrorMessage: data.expectedErrorMessage,
        });
        expect(result.isMobileErrorDisplayed).toBe(true);
        expect(result.errorMessage).toContain(data.expectedErrorMessage);
        expect(result.isOTPPageVisible).toBe(false);
    });

    

    test('@Medium IW3-T1866: Verify that user can able to login with new password credentials', async ({ page }) => {
        test.setTimeout(300000);
        const staticData = testCaseData['tc-auth-022-reset-password-login'];
        const email = await getRandomYopmailAddress();
        const data = { ...staticData, email };

        const result = await verifyLoginWithNewPasswordCredentials(page, {
            email: data.email,
            password: data.password,
            newPassword: data.newPassword,
            expectedMarketingText: data.expectedMarketingText,
            expectedOTPHeading: data.expectedOTPHeading,
            expectedNewPasswordHeading: data.expectedNewPasswordHeading,
            expectedSuccessMessage: data.expectedSuccessMessage,
        });

        expect(result.isHomeScreenVisible).toBe(true);
        expect(result.isAccountPageVisible).toBe(true);
        expect(result.displayedEmail).toBe(data.email);
    });

    test('@High - IW3-T1867: Verify the "Login with TV Provider" functionality', async ({ page }) => {
        const data = testCaseData['tc-auth-005-tv-provider-login'];
        const result = await loginWithTVProvider(page, {
            providerName: data.providerName,
            mode: data.mode
        });
        expect(result.isLoggedIn).toBe(true);
    });
    test('@Medium IW3-T1869: Verify the UI/UX of the Welcome to iWant screen for PH region', async ({ page }) => {
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

    test('@Medium @D IW3-T4024 Verify the validation of first name and last name fields inside the Edit Profile screen', async ({ page }) => {
        const data = testCaseData['tc-auth-017-edit-profile-name-validation'];
        const loginResult = await loginToOTT(page, {
            mode: data.mode,
        });
        const result = await validateEditProfileNameFields(page, {
            mode: data.mode,
            firstName: data.firstName,
            lastName: data.lastName,
        });
        expect(loginResult.isLoggedIn).toBe(true);
        expect(result.isFirstNameFieldVisible).toBe(true);
        expect(result.isLastNameFieldVisible).toBe(true);
        expect(result.isValidationErrorDisplayed).toBe(true);
    });
});
