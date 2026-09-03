import { test, expect } from '../../src/fixtures/test-hooks';
import { loginToOTT } from '../../src/businessFunction/ott-auth-bfs';
import { verifySubscribeToWatchCTA, navigateToUpgradePlanFromSubscriptionBlocker } from '../../src/businessFunction/ott-subscription-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';
import { verifyPremiumContentGate, verifySubscribeToWatchCarouselMessage } from '../../src/businessFunction/ott-playback-bfs';

test.describe('Premium content subscription', () => {
  test('@High @D IW3-T2033: Verify that "Subscribe to watch" CTA is displayed for premium contents inside content details', async ({ page }) => {
    const data = testCaseData['tc-sub-001-subscribe-to-watch'];
    const loginResult = await loginToOTT(page, { mode: data.mode });
    expect(loginResult.isLoggedIn).toBe(true);
    const result = await verifySubscribeToWatchCTA(page, {
      mode: data.mode,
      searchTerm: data.searchTerm,
    });
    expect(result.isDetailsPageVisible).toBe(true);
    expect(result.isSubscribeToWatchCtaVisible).toBe(true);
  });

  test('@High @D IW3-T2039: Verify navigation on tapping "Upgrade Plan" button from the subscription blocker screen', async ({ page }) => {
    const data = testCaseData['tc-sub-002-upgrade-plan'];
    const result = await navigateToUpgradePlanFromSubscriptionBlocker(page, {
      mode: data.mode,
    });

    expect(result.isGmaTabVisible).toBe(true);
    expect(result.isUpgradePlanVisible).toBe(true);
    expect(result.isPlansPageVisible).toBe(true);
  });

  test('@High IW3-T2025: Verify the message displayed when user tries to play premium content', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-play-002-premium-content-gate'];
    const result = await verifyPremiumContentGate(page, {
      mode: data.mode,
      expectedMessage: data.expectedMessage,
      expectedMaybeLaterText: data.expectedMaybeLaterText,
      expectedSubscribeText: data.expectedSubscribeText,
    });
    expect(result.playAttempted).toBeTruthy();
    expect(result.premiumGateDisplayed).toBeTruthy();
    expect(result.gateMessage).toContain(data.expectedMessage);
    expect(result.maybeLaterVisible).toBeTruthy();
    expect(result.subscribeToWatchVisible).toBeTruthy();
  });

  test('@High @mWeb IW3-T2032: Verify that "Subscribe to watch" CTA is displayed for premium carousel contents for free user', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-sub-002-premium-carousel-subscribe-cta'];
    const result = await verifySubscribeToWatchCarouselMessage(page, {
      mode: data.mode,
      expectedMessage: data?.expectedMessage,
      expectedMaybeLaterText: data?.expectedMaybeLaterText,
      expectedSubscribeText: data?.expectedSubscribeText,
    });
    expect(result.loginSuccessful).toBeTruthy();
    expect(result.carouselChecked).toBeTruthy();
    expect(result.promptObserved).toBeTruthy();
    expect(result.maybeLaterVisible || result.subscribeToWatchVisible).toBeTruthy();
    expect(result.message.toLowerCase()).toContain((data?.expectedSubscribeText || 'subscribe to watch').toLowerCase());
  });

  test('@High IW3-T2035: Verify the message displayed on "Subscribe to watch" CTA from Home/Shows/Movies/GMA tabs from "Carousel"', async ({ page }) => {
    test.setTimeout(180000);
    const data = testCaseData['tc-sub-001-carousel-subscribe-cta'];
    const result = await verifySubscribeToWatchCarouselMessage(page, {
      mode: data.mode,
      expectedMessage: data.expectedMessage,
      expectedMaybeLaterText: data.expectedMaybeLaterText,
      expectedSubscribeText: data.expectedSubscribeText,
    });
    expect(result.loginSuccessful).toBeTruthy();
    expect(result.promptObserved || result.subscribeToWatchVisible || result.message.length > 0).toBeTruthy();
    expect(result.message.toLowerCase()).toContain(data.expectedSubscribeText.toLowerCase().split(' ')[0]);
    expect(result.maybeLaterVisible || result.subscribeToWatchVisible).toBeTruthy();
  });
});
