import { test, expect } from '../../src/fixtures/test-hooks';
import { verifyEarlyAccessTag, verifyEarlyAccessUpgradePromptMessage, verifyEarlyAccessEpisodeTag, verifyEarlyAccessNotInContinueWatchingAfterPlayback } from '../../src/businessFunction/ott-early-access-bfs';
import testCaseData from '../../src/data/ott-test-cases.json';

test.describe('Early Access Tag', () => {
    test('@High IW3-T3667: Verify Early Access tag is shown on On Air content thumbnail', async ({ page }) => {
        test.setTimeout(90000)
        const data = testCaseData['tc-discovery-001-early-access'];
        const result = await verifyEarlyAccessTag(page, { mode: data.mode, graphqlQueryName: data.graphqlQueryName, labelText: data.labelText, earlyAccessAttributeValue: data.earlyAccessAttributeValue });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        expect(result.labelVisible).toBe(true);
    });

    test ('@High IW3-T3672: Verify the Early Access upgrade prompt message for free or basic users', async ({ page }) => {
        test.setTimeout(50000)
        const data = testCaseData['tc-discovery-002-early-access-upgrade-prompt'];
        const result = await verifyEarlyAccessUpgradePromptMessage(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            labelText: data.labelText,
            earlyAccessAttributeValue: data.earlyAccessAttributeValue,
            expectedUpgradeTitle: data.expectedUpgradeTitle,
            expectedUpgradeDescription: data.expectedUpgradeDescription,
            expectedMaybeLaterText: data.expectedMaybeLaterText,
            expectedUpgradeCtaText: data.expectedUpgradeCtaText,
            parentalPin: data.pin,
 
        });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        if (process.env.BROWSER === 'mchrome') {
            expect(result.titleVisible).toBe(true);
            expect(result.titleText).toContain(data.mwebExpectedUpgradeMessage);
            expect(result.descriptionVisible).toBe(true);
            expect(result.upgradeCtaVisible).toBe(true);
        } else {
            expect(result.upgradeIconVisible).toBe(true);
            expect(result.titleVisible).toBe(true);
            expect(result.descriptionVisible).toBe(true);
            expect(result.upgradeCtaVisible).toBe(true);
        }
        expect(result.maybeLaterVisible).toBe(true);
    });

    test ('@High IW3-T3670: Verify the popup displayed when free or basic users tap on Early Access content', async ({ page }) => {
        test.setTimeout(50000)
        const data = testCaseData['tc-discovery-003-early-access-popup'];
        const result = await verifyEarlyAccessUpgradePromptMessage(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            labelText: data.labelText,
            earlyAccessAttributeValue: data.earlyAccessAttributeValue,
            expectedUpgradeTitle: data.expectedUpgradeTitle,
            expectedUpgradeDescription: data.expectedUpgradeDescription,
            expectedMaybeLaterText: data.expectedMaybeLaterText,
            expectedUpgradeCtaText: data.expectedUpgradeCtaText,
            parentalPin: data.pin,
 
        });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        expect(result.upgradeIconVisible).toBe(true);
        expect(result.titleVisible).toBe(true);
        expect(result.descriptionVisible).toBe(true);
        expect(result.maybeLaterVisible).toBe(true);
        expect(result.upgradeCtaVisible).toBe(true);
    });

    test('@High IW3-T3675: Verify Early Access tag is shown on the episode thumbnail inside the content details screen', async ({ page }) => {
        test.setTimeout(50000)
        const data = testCaseData['tc-discovery-004-early-access-episode-tag'];
        const result = await verifyEarlyAccessEpisodeTag(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            labelText: data.labelText,
            earlyAccessAttributeValue: data.earlyAccessAttributeValue,
        });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        expect(result.labelVisible).toBe(true);
    });
    test('@High IW3-T3679: Verify Early Access content with the tag is not displayed on the Continue Watching tray after partial playback', async ({ page }) => {
        test.setTimeout(180000)
        const data = testCaseData['tc-discovery-005-early-access-continue-watching'];
        const result = await verifyEarlyAccessNotInContinueWatchingAfterPlayback(page, {
            mode: data.mode,
            graphqlQueryName: data.graphqlQueryName,
            labelText: data.labelText,
            earlyAccessAttributeValue: data.earlyAccessAttributeValue,
            parentalPin: data.pin,
        });
        expect(result.loggedIn).toBe(true);
        expect(result.foundInGraphQL).toBe(true);
        expect(result.assetVisibleInContinueWatching).toBe(false);
        
    });
});
