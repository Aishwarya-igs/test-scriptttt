import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyParentalPinOptionVisibility, verifyParentalPinToggleState, verifyParentalPinPasswordField, submitParentalPinPassword, verifyParentalPinPasswordVisibility, verifyParentalPinInvalidPasswordError, verifyParentalPinFourDigitInput, verifyParentalPinSaveSuccess, verifyParentalPinPromptOnContentPlayback, verifyParentalPinInvalidPlaybackPrompt, disableParentalPin, verifyParentalPinPlaybackAllowedWhenDisabled } from '../../src/businessFunction/ott-auth-bfs';
import { verifyContinueWatchingPlaybackFromTrayWithParentalPin } from '../../src/businessFunction/ott-continue-watching-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { env } from 'process';

test.describe('Parental controls', () => {
  test('@High - IW3-T2094 : Verify Parental pin option will be available in Settings page', async ({ page }) => {
    const data = testCaseData['tc-settings-001-parental-controls'];
    const result = await verifyParentalPinOptionVisibility(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
  });

  test('@High - IW3-T2095 : Verify Parental pin toggle will be in disable state by default', async ({ page }) => {
    const data = testCaseData['tc-settings-002-parental-toggle-disabled'];
    const result = await verifyParentalPinToggleState(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.toggleDisabled).toBe(true);
  });

  test('@High - IW3-T2097 : Verify Password text field will be display when user click on parental pin toggle', async ({ page }) => {
    const data = testCaseData['tc-settings-003-parental-password-field'];
    const result = await verifyParentalPinPasswordField(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
  });

  test('@High - IW3-T2098 : Verify Password text field will be display when user click on parental pin toggle and submit with password', async ({ page }) => {
    const data = testCaseData['tc-settings-004-parental-pin-submission'];
    const result = await submitParentalPinPassword(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordSubmitted).toBe(true);
    expect(result.pinSetupMessageVisible).toBe(true);
  });

  test('@Low - IW3-T2099 : Verify "eye" icon will be display in password text field and user is able to see entered value when enables the eye icon', async ({ page }) => {
    const data = testCaseData['tc-settings-005-parental-password-visibility'];
    const result = await verifyParentalPinPasswordVisibility(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
    expect(result.passwordVisibleAfterToggle).toBe(true);
    expect(result.eyeIconVisible).toBe(true);
    expect(result.passwordValue).toBeTruthy();
    expect(result.passwordValue.length).toBeGreaterThan(0);
  });

  test('@Medium - IW3-T2100 : Verify "Invalid credentials. Please try again." error message on incorrect parental PIN password', async ({ page }) => {
    const data = testCaseData['tc-settings-006-parental-invalid-password'];
    const result = await verifyParentalPinInvalidPasswordError(page, {
      mode: data.mode,
      invalidPassword: data.invalidPassword,
      expectedErrorMessage: data.expectedErrorMessage,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
    expect(result.errorMessageVisible).toBe(true);
    expect(result.errorMessageText).toContain(data.expectedErrorMessage);
  });

  test('@High - IW3-T2101 : Verify 4 digit numeric pin will be display when user enable the parental pin toggle', async ({ page }) => {
    const data = testCaseData['tc-settings-007-parental-pin-4digit'];
    const result = await verifyParentalPinFourDigitInput(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
    expect(result.pinInputBoxesVisible).toBe(true);
    expect(result.pinInputCount).toBe(4);
    expect(result.pinAcceptsNumericOnly).toBe(true);
  });

  test('@High - IW3-T2102 : Verify parental PIN accepts numeric values only', async ({ page }) => {
    const data = testCaseData['tc-settings-008-parental-pin-numeric-only'];
    const result = await verifyParentalPinFourDigitInput(page, {
      mode: data.mode,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
    expect(result.pinInputBoxesVisible).toBe(true);
    expect(result.pinInputCount).toBe(4);
    expect(result.pinAcceptsNumericOnly).toBe(true);
  });

  test('@Medium - IW3-T2103 : Verify success message is display when user setup the parental pin', async ({ page }) => {
    const data = testCaseData['tc-settings-009-parental-pin-success-message'];
    const result = await verifyParentalPinSaveSuccess(page, {
      mode: data.mode,
      pin: data.pin || '1234',
      expectedSuccessHeader: data.expectedSuccessHeader,
      expectedSuccessDetails: data.expectedSuccessDetails,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordFieldVisible).toBe(true);
    expect(result.pinInputBoxesVisible).toBe(true);
    expect(result.pinInputCount).toBe(4);
    expect(result.successMessageVisible).toBe(true);
    expect(result.successMessage).toContain(data.expectedSuccessHeader);
    expect(result.successHeaderVisible).toBe(true);
    expect(result.successDetails).toContain(data.expectedSuccessDetails);
    expect(result.continueButtonVisible).toBe(true);
  });

  test('@High - IW3-T2104 : Verify Parental Pin prompt is displayed when user tries to play content after setup', async ({ page }) => {
    const data = testCaseData['tc-settings-010-parental-pin-prompt-on-playback'];
    const result = await verifyParentalPinPromptOnContentPlayback(page, {
      mode: data.mode,
      pin: data.pin,
      expectedPromptText: data.expectedParentalPinPromptText,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.parentalPinPromptVisible).toBe(true);
    expect(result.parentalPinPromptText).toContain(data.expectedParentalPinPromptText);
  });

  test('@High - IW3-T2108 : Verify Invalid Pin error is displayed when incorrect parental PIN is entered during playback', async ({ page }) => {
    const data = testCaseData['tc-settings-011-parental-pin-invalid-playback'];
    const result = await verifyParentalPinInvalidPlaybackPrompt(page, {
      mode: data.mode,
      pin: data.pin,
      invalidPin: data.invalidPin,
      expectedPromptText: data.expectedParentalPinPromptText,
      expectedInvalidPinErrorText: data.expectedInvalidPinErrorText,
    });
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.parentalPinPromptVisible).toBe(true);
    expect(result.parentalPinPromptText).toContain(data.expectedParentalPinPromptText);
    expect(result.parentalPinInvalidErrorVisible).toBe(true);
    expect(result.parentalPinInvalidErrorText).toContain(data.expectedInvalidPinErrorText);
  });

  test('@Medium - IW3-T2111 : Verify selected Continue Watching episode resumes playback from last watched position with parental PIN enabled', async ({ page }) => {
    test.setTimeout(300000);
    const data = testCaseData['tc-settings-014-parental-pin-resume-continue-watching'];
    const result = await verifyContinueWatchingPlaybackFromTrayWithParentalPin(page, {
      mode: data.mode,
      password: data.password,
      parentalPin: data.pin,
    });
    expect(result.itemFound).toBe(true);
    expect(result.playerVisible).toBe(true);
    expect(result.parentalPinPromptVisible).toBe(true);
    expect(result.parentalPinSubmitted).toBe(true);
  });

  test('@High - IW3-T2105 : Verify parental PIN toggle gets disabled after entering the password', async ({ page }) => {
    const data = testCaseData['tc-settings-012-parental-pin-toggle-disabled-after-password'];
    const result = await disableParentalPin(page, {
      mode: data.mode,
      expectedSuccessHeader: data.expectedSuccessHeader,
      expectedSuccessDetails: data.expectedSuccessDetails,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.passwordSubmitted).toBe(true);
    expect(result.toggleDisabledAfterSubmission).toBe(true);
  });
  test('@High - IW3-T2107 : Verify user is able to play any content if parental pin is turned off', async ({ page }) => {
    const data = testCaseData['tc-settings-013-parental-pin-off-allows-playback'];
    const result = await verifyParentalPinPlaybackAllowedWhenDisabled(page, {
      mode: data.mode,
    });
    expect(result.isLoggedIn).toBe(true);
    expect(result.parentalControlsVisible).toBe(true);
    expect(result.parentalPinEnabled).toBe(false);
    expect(result.parentalPinPromptVisible).toBe(false);
    expect(result.playbackStarted).toBe(true);
  });
});
