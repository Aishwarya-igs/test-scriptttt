import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { logger } from '../utils/logger';
import { OTTAuthPage } from './OTTAuthPage';

export class OTTEarlyAccessPage {
    private page: Page;
    private pageUtils: PageUtils;
    private readonly defaultLabelText: string;
    private readonly upgradeIconSelector: PageElement;
    private readonly upgradeTitleSelector: PageElement;
    private readonly upgradeDescriptionSelector: PageElement;
    private readonly maybeLaterSelector: PageElement;
    private readonly upgradeCtaSelector: PageElement;
    private readonly earlyAccessLabelSelector: PageElement;
    private readonly earlyAccessBadgeSelector: PageElement;
    private readonly clickableAncestorSelector: PageElement;
    private readonly followingSiblingBadgeSelector: PageElement;
    private readonly episodeCardAncestorSelector: PageElement;
    private readonly railTitleSelector: PageElement;
    private readonly assetImageSelector: PageElement;
    private readonly badgeAltSelector: PageElement;
    private readonly episodeListSelector: PageElement;
    private readonly episodeBadgeSelector: PageElement;
    private readonly episodeCardBaseSelector: PageElement;
    private readonly episodeCardClickableSelector: PageElement;
    private readonly episodeBadgeMultiVariantSelector: PageElement;
    private resolveSelector(template: string, params: Record<string, string> = {}): string {
        let resolved = template;
        Object.entries(params).forEach(([key, value]) => {
            resolved = resolved.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        return resolved;
    }
    private readonly earlyAccessEpisodeTagSelector: PageElement;
    private readonly firstEarlyAccessEpisodeSelector: PageElement;
    private selectedEarlyAccessTagIndex: number | null = null;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.defaultLabelText = 'Early Access';
        this.upgradeIconSelector = { selector: '//img[@alt="early_access" or @alt="early-access"]' };
        this.upgradeTitleSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/A valid subscription is required to view this content/i' }
          : { selector: 'text=/Unlock Early Access/i' };
        this.upgradeDescriptionSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/EPS-401-24/i' }
          : { selector: 'text=/Upgrade to Premium for exclusive early viewing and be the first to watch new content\./i' };
        this.maybeLaterSelector = { selector: '//p[text()="Maybe Later"]' };
        this.upgradeCtaSelector = process.env.BROWSER === 'mchrome'
          ? { selector: 'text=/Login/i' }
          : { selector: 'text=/Upgrade to Watch Now/i' };
        this.earlyAccessLabelSelector = { selector: `(//img[@alt="{assetTitle}"]/parent::div/following-sibling::div//img[@alt="early_access"])[1]` };
        this.earlyAccessBadgeSelector = { selector: 'img[alt="early_access"], img[alt="early-access"], [aria-label*="early access" i], [data-testid*="early-access" i]' };
        this.clickableAncestorSelector = { selector: 'xpath=ancestor::*[self::a or self::button or @role="button" or contains(@class, "cursor-pointer")][1]' };
        this.followingSiblingBadgeSelector = { selector: 'xpath=../following-sibling::div//img[@alt="{labelText}"]' };
        this.episodeCardAncestorSelector = { selector: 'xpath=ancestor::div[contains(@class, "cursor-pointer")][1]' };
        this.railTitleSelector = { selector: 'text={railTitle}' };
        this.assetImageSelector = { selector: 'img[alt="{assetTitle}"]' };
        this.badgeAltSelector = { selector: 'img[alt="{badgeAlt}"]' };
        this.episodeListSelector = { selector: '[class*="episodes-list"]' };
        this.episodeBadgeSelector = { selector: 'img[alt="{labelText}"]' };
        this.episodeCardBaseSelector = { selector: 'div' };
        this.episodeCardClickableSelector = { selector: '.episode-info, .episode-card, .episode-item, [data-testid*="episode"]' };
        this.episodeBadgeMultiVariantSelector = { selector: 'img[alt="{labelText}"], img[alt="Early Access"], [aria-label="Early Access"], [data-testid*="early-access" i]' };
        this.earlyAccessEpisodeTagSelector = { selector: '(//div[contains(@class,"thumbnail-label")]//img[@alt="early_access"])[1]' };
        this.firstEarlyAccessEpisodeSelector = { selector: '(//img[@alt="early_access"])[1]' };
    }

    async scrollToRail(railTitle: string): Promise<void> {
        logger.step(`Processing rail: ${railTitle}`);
      if (!railTitle.trim()) {
        return;
      }
        if (railTitle.includes('Hero Banner - ROW')) {
            logger.info(`Skipping scroll for rail: ${railTitle}`);
            return;
        }
        const railSelector = this.resolveSelector(this.railTitleSelector.selector ?? '', { railTitle });
        const rail = this.page.locator(railSelector).first();
        await rail.scrollIntoViewIfNeeded();
    }

      async findAssetByBadge(badgeAlt: string): Promise<{ assetTitle: string; railTitle: string } | null> {
        const badgeSelector = this.resolveSelector(this.badgeAltSelector.selector ?? '', { badgeAlt });
        const badge = this.page.locator(badgeSelector).first();
        if (!await badge.count()) {
          return null;
        }
        await badge.scrollIntoViewIfNeeded().catch(() => undefined);
        const card = badge.locator(this.clickableAncestorSelector.selector ?? '').first();
        const scope = await card.count() ? card : badge.locator('xpath=..');
        const titleImage = scope.locator('img[alt]').first();
        const assetTitle = (await titleImage.getAttribute('alt').catch(() => ''))?.trim() ?? '';
        return assetTitle ? { assetTitle, railTitle: '' } : null;
      }

    async findAssetLocatorByTitle(
        assetTitle: string,
        labelText: string = this.defaultLabelText,
        additionalLabelText?: string
    ) {
      const assetsSelector = this.resolveSelector(this.assetImageSelector.selector ?? '', { assetTitle });
      const assets = this.page.locator(assetsSelector);
      await assets.first().waitFor({ state: 'visible', timeout: 10000 });

      const count = await assets.count();
      for (let index = 0; index < count; index += 1) {
        const asset = assets.nth(index);
        await asset.scrollIntoViewIfNeeded().catch(() => undefined);
        const badgeContainerSelector = this.resolveSelector(this.followingSiblingBadgeSelector.selector ?? '', { labelText });
        const badgeContainer = asset.locator(badgeContainerSelector);
        const hasEarlyAccessBadge = await badgeContainer.count().catch(() => 0);
        const hasAdditionalBadge = additionalLabelText
            ? await asset.locator(
                this.resolveSelector(this.followingSiblingBadgeSelector.selector ?? '', { labelText: additionalLabelText })
              ).count().catch(() => 0)
            : 1;
        if (hasEarlyAccessBadge > 0 && hasAdditionalBadge > 0) {
            return asset;
        }
      }

      return assets.first();
    }

    async isLabelVisibleForAsset(assetLocator: any, labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
        if (process.env.BROWSER === 'mchrome') {
          await assetLocator.scrollIntoViewIfNeeded();
          return await assetLocator.isVisible();
        }
            const resolvedSelector = this.resolveSelector(this.followingSiblingBadgeSelector.selector ?? '', { labelText: label });
            const tagLocator = assetLocator.locator(resolvedSelector).first();
        await this.scrollToEarlyAccessThumbnail(tagLocator);
            await tagLocator.waitFor({ state: 'visible', timeout: 15000 });
            return true;
        }
        catch {
            return false;
        }
    }

    async scrollToEarlyAccessThumbnail(tagLocator: any): Promise<void> {
      await tagLocator.waitFor({ state: 'attached', timeout: 15000 });
      await tagLocator.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(750);
    }

    async openAssetDetails(assetTitle: string, labelText: string = this.defaultLabelText): Promise<void> {
      const asset = await this.findAssetLocatorByTitle(assetTitle, labelText);
        const clickableCard = asset.locator(this.clickableAncestorSelector.selector ?? '').first();
        if (await clickableCard.count()) {
          await clickableCard.dblclick({ force: true });
            return;
        }
        await asset.dblclick({ force: true });
    }

    async isEpisodeLabelVisible(labelText?: string): Promise<boolean> {
        const label = labelText ?? this.defaultLabelText;
        try {
        const episodeList = this.page.locator(this.episodeListSelector.selector ?? '').first();
        await episodeList.waitFor({ state: 'visible', timeout: 15000 });
        await episodeList.scrollIntoViewIfNeeded();

        let episodeLabel = episodeList.locator(this.resolveSelector(this.episodeBadgeSelector.selector ?? '', { labelText: label })).last();
        for (let attempt = 0; attempt < 12 && !await episodeLabel.count(); attempt += 1) {
          const episodeCards = episodeList.locator('div').filter({ has: episodeList.locator('img[alt]') });
          const cardCount = await episodeCards.count().catch(() => 0);
          if (cardCount > 0) {
            await episodeCards.last().scrollIntoViewIfNeeded().catch(() => undefined);
          }
          await episodeList.evaluate((element: HTMLElement) => {
            element.scrollTop = element.scrollHeight;
          }).catch(() => undefined);
          await this.page.mouse.wheel(0, 700).catch(() => undefined);
          await this.page.waitForTimeout(500);
          const resolvedBadgeSelector = this.resolveSelector(this.episodeBadgeSelector.selector ?? '', { labelText: label });
          episodeLabel = episodeList.locator(resolvedBadgeSelector).last();
        }

        if (!await episodeLabel.count()) {
          return false;
        }

        await this.scrollToEarlyAccessThumbnail(episodeLabel);
        return await episodeLabel.isVisible();
        } catch {
            return false;
        }
    }

    async openLatestEarlyAccessEpisode(labelText: string): Promise<boolean> {
      if (process.env.BROWSER !== 'mchrome') {
      const episodeList = this.page.locator(this.episodeListSelector.selector ?? '').first();
      await episodeList.waitFor({ state: 'visible', timeout: 10000 });
      await episodeList.scrollIntoViewIfNeeded();

      let badge = episodeList.locator(this.resolveSelector(this.episodeBadgeSelector.selector ?? '', { labelText: labelText })).last();
      for (let attempt = 0; attempt < 12 && !await badge.count(); attempt += 1) {
        const episodeCards = episodeList.locator('div').filter({ has: episodeList.locator('img[alt]') });
        const cardCount = await episodeCards.count().catch(() => 0);
        if (cardCount > 0) {
          await episodeCards.last().scrollIntoViewIfNeeded().catch(() => undefined);
        }
        await episodeList.evaluate((element: HTMLElement) => {
          element.scrollTop = element.scrollHeight;
        }).catch(() => undefined);
        await this.page.mouse.wheel(0, 700).catch(() => undefined);
        await this.page.waitForTimeout(500);
        badge = episodeList.locator(this.resolveSelector(this.episodeBadgeSelector.selector ?? '', { labelText: labelText })).last();
      }

      if (!await badge.count()) {
        logger.warn(`No episode found with the '${labelText}' badge`);
            return false;
        }

      await badge.scrollIntoViewIfNeeded();
      const episodeCard = badge.locator(this.episodeCardAncestorSelector.selector ?? '').first();
      const target = await episodeCard.count() ? episodeCard : badge;
      const episodeName = (await target.textContent().catch(() => ''))?.trim() ?? '';
      logger.info(`Clicking Early Access episode: ${episodeName}`);
      await target.click({ force: true });
      await this.page.waitForTimeout(1500);
        return true;
      }

      const episodeList = this.page.locator(
        '.episodes-list, .season-episodes, .episode-list, [data-testid*="episode-list"], [class*="season-episodes"]'
      ).first();
      await episodeList.waitFor({ state: 'visible', timeout: 15000 });
      await episodeList.scrollIntoViewIfNeeded();

      const badgeSelectorVariants = this.resolveSelector(this.episodeBadgeMultiVariantSelector.selector ?? '', { labelText: labelText });
      const textBadge = this.page.getByText('Early Access', { exact: true }).last();
      let badge = episodeList.locator(badgeSelectorVariants).last();
      for (let attempt = 0; attempt < 12 && !await badge.count() && !await textBadge.count(); attempt += 1) {
        const episodeCards = episodeList.locator(
          '.episode-info, .episode-card, .episode-item, [data-testid*="episode"]'
        ).last();
        if (await episodeCards.count().catch(() => 0)) {
          await episodeCards.scrollIntoViewIfNeeded().catch(() => undefined);
        }
        await episodeList.evaluate((element: HTMLElement) => {
          element.scrollTop = element.scrollHeight;
        }).catch(() => undefined);
        await this.page.mouse.wheel(0, 700).catch(() => undefined);
        await this.page.waitForTimeout(500);
        badge = episodeList.locator(badgeSelectorVariants).last();
      }

      if (!await badge.count() && !await textBadge.count()) {
        logger.warn(`No episode found with the '${labelText}' badge`);
        return false;
      }

      const targetBadge = await badge.count() ? badge : textBadge;
      await targetBadge.scrollIntoViewIfNeeded().catch(() => undefined);
      const episodeCard = targetBadge.locator(this.episodeCardClickableSelector.selector ?? '').first();
      const target = await episodeCard.count() ? episodeCard : targetBadge;
      const episodeName = (await target.textContent().catch(() => ''))?.trim() ?? '';
      logger.info(`Clicking Early Access episode: ${episodeName}`);
      await target.click({ force: true });
      await this.page.waitForTimeout(1500);
      return true;
    }

    async verifyUpgradePromptMessage() {
        const upgradeIconVisible = await this.pageUtils.isVisible(this.upgradeIconSelector)
        const titleVisible = await this.pageUtils.isVisible(this.upgradeTitleSelector);
      const titleText = titleVisible
        ? await this.pageUtils.getTextContent(this.upgradeTitleSelector).catch(() => '')
        : '';
        const descriptionVisible = await this.pageUtils.isVisible(this.upgradeDescriptionSelector);
        const maybeLaterVisible = await this.pageUtils.isVisible(this.maybeLaterSelector);
        const upgradeCtaVisible = await this.pageUtils.isVisible(this.upgradeCtaSelector);
        return {
            upgradeIconVisible,
            titleVisible,
            titleText,
            descriptionVisible,
            maybeLaterVisible,
            upgradeCtaVisible
        };
    }

    async scrollUntilEarlyAccessTagVisible(maxScrolls: number = 20): Promise<boolean> {
        try {
            const tagCandidates = this.page.locator(this.earlyAccessBadgeSelector.selector ?? '');
            const count = await tagCandidates.count().catch(() => 0);
            if (!count) {
                return false;
            }

            for (let scroll = 0; scroll < maxScrolls; scroll += 1) {
                const count = await tagCandidates.count().catch(() => 0);
                logger.info(`Checking Early Access tags. Found ${count} candidate(s). Scroll ${scroll + 1}/${maxScrolls}`);
                for (let index = 0; index < count; index += 1) {
                    const candidate = tagCandidates.nth(index);
                    await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
                    await this.page.waitForTimeout(750);
                    if (await candidate.isVisible().catch(() => false)) {
                        this.selectedEarlyAccessTagIndex = index;
                        logger.info(`Early Access tag found at index ${index}`);
                        return true;
                    }
                }

                await this.page.mouse.wheel(0, 400);
                await this.page.waitForTimeout(1000);
            }
            return false;
        } catch (error) {
            logger.debug('Early Access tag visibility check failed', error);
            return false;
        }
    }

    async clickEpisodeCardWithEarlyAccessTag(): Promise<boolean> {
        logger.elementInteraction('click', 'episode card with Early Access tag');
        try {
            const earlyAccessTag = this.page.locator(this.earlyAccessBadgeSelector.selector ?? '').first();
            await earlyAccessTag.waitFor({ state: 'visible', timeout: 15000 });
            const clickableAncestor = earlyAccessTag.locator(this.clickableAncestorSelector.selector ?? '').first();
            if (await clickableAncestor.count()) {
                await clickableAncestor.scrollIntoViewIfNeeded().catch(() => undefined);
                await clickableAncestor.click({ timeout: 20000, force: true });
                return true;
            }

            await earlyAccessTag.click({ timeout: 20000, force: true });
            return true;
        } catch (error) {
            logger.debug('Clicking episode card with Early Access tag failed', error);
            return false;
        }
    }

    async clickFirstEpisodeWithEarlyAccessContent(): Promise<boolean> {
        logger.elementInteraction('click', 'first episode with Early Access content');
        try {
            await this.pageUtils.scrollIntoView(this.firstEarlyAccessEpisodeSelector);
            await this.pageUtils.safeClick(this.firstEarlyAccessEpisodeSelector, 20000);
            return true;
        } catch (error) {
            logger.debug('Clicking first episode with Early Access content failed', error);
            return false;
        }
    }

}
