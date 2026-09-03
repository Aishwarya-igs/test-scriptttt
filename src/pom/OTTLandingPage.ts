import { Page } from '@playwright/test';
import { logger } from '../utils/logger';
import { PageElement } from '../types/index';
import { OTTAuthPage } from './OTTAuthPage';
import { OTTDetailsPage } from './OTTDetailsPage';

export class OTTLandingPage {
  private readonly page: Page;
  private readonly top10ShowsHeading: PageElement;
  private readonly top10RailHeading: PageElement;
  private readonly firstThumbnail: PageElement;
  private readonly gptBannerAdLocator: PageElement;
  private readonly googleAdsIframeLocator: PageElement;
  private readonly top10ShowsTrayLocator: PageElement;
  private readonly top10FirstImageLocator: PageElement;
  private readonly searchInputLocator: PageElement;
  private readonly top10BadgeLocator: PageElement;
  private readonly sponsoredRailLocator: PageElement;
  private readonly sponsoredRailNonContentAreaLocator: PageElement;
  private readonly sponsoredRailAdvertiserLogoLocator: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.top10ShowsHeading = { selector: 'text=/Top 10 Shows/i' };
    this.top10RailHeading = { selector: 'text=/Top 10/i' };
    this.firstThumbnail = { selector: 'img.title-image, [data-testid*="content-card"], .thumbnail' };
    this.gptBannerAdLocator = { selector: 'xpath=//div[contains(@id,"gpt-banner-ad-10")]' };
    this.googleAdsIframeLocator = { selector: "//div[contains(@id, 'gpt-banner-ad')][.//iframe[contains(@id, 'google_ads')]]" };
    this.top10ShowsTrayLocator = { selector: 'section, div' };
    this.top10FirstImageLocator = { selector: 'xpath=(.//div[contains(@class,\'flex items-end justify-end\')]//img[contains(@class,\'title-image\')])[1]' };
    this.searchInputLocator = { selector: 'input[placeholder*="Search"], input[type="search"], [placeholder*="Search"], [aria-label*="Search"], [title*="Search"], [data-testid*="search"]' };
    this.top10BadgeLocator = { selector: "//img[@alt='top_10']" };
    this.sponsoredRailLocator = { selector: 'xpath=//div[contains(@class,\'rail z-1\')][.//img[contains(@src,\'_Ad_Portrait_Thumbnail\') or contains(@srcset,\'_Ad_Portrait_Thumbnail\')]]' };
    this.sponsoredRailNonContentAreaLocator = { selector: 'xpath=//div[contains(@class,\'rail z-1\')]//div[contains(@class,\'title\')]//img[contains(@class,\'object-contain\')]' };
    this.sponsoredRailAdvertiserLogoLocator = { selector: 'xpath=//div[contains(@class,\'rail z-1\')]//div[contains(@class,\'title\')]//img[contains(@class,\'object-contain\')]' };
  }

  async scrollToTop10ShowsTray(): Promise<void> {
    logger.elementInteraction('scroll', 'Top 10 Shows tray');
    const showsHeadingLocator = this.page.getByText(this.top10ShowsHeading.selector).first();
    await showsHeadingLocator.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForTimeout(4000);
  }

  async addFirstVisibleTop10ContentToWatchlist(): Promise<string> {
    logger.elementInteraction('click', 'first visible content in Top 10 Shows tray');
    await this.scrollTillTop10Rail();
    await this.page.waitForTimeout(3000);
    const tray = this.page.locator(this.top10ShowsTrayLocator.selector).filter({ has: this.page.getByText(/Top 10 Shows/i) }).first();
    const firstImage = tray.locator(this.top10FirstImageLocator.selector);
    if (!(await firstImage.count())) {
      return '';
    }

    await firstImage.scrollIntoViewIfNeeded().catch(() => undefined);
    await firstImage.click({ timeout: 20000, force: true }).catch(() => undefined);
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => undefined);
    await this.page.waitForTimeout(5000);
    const detailsPage = new OTTDetailsPage(this.page);
    await detailsPage.clickWatchlistIcon().catch(() => undefined);
    await this.page.waitForTimeout(2000);
    return await detailsPage.validateAddedToWatchlistPopup().catch(() => '');
  }

  async searchForContent(query: string): Promise<void> {
    logger.elementInteraction('search', `search query: ${query}`);
    const authPage = new OTTAuthPage(this.page);
    try {
      await authPage.clickSearchBar();
      await authPage.enterSearchQuery(query);
      await authPage.submitSearchQuery();
      await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
      return;
    } catch (error) {
      logger.debug('Primary search interaction failed, falling back to direct locator input', error);
    }
    const searchInput = this.page.locator(this.searchInputLocator.selector).first();
    await searchInput.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    await searchInput.click({ timeout: 10000 }).catch(() => undefined);
    await searchInput.fill(query, { timeout: 10000 }).catch(() => undefined);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);
  }

  async scrollTillTop10Rail(): Promise<void> {
    logger.elementInteraction('scroll', 'Top 10 rail content');
    const tag = this.page.getByText(/Top 10/i).first();
    await tag.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForTimeout(3000);
  }

  async isTop10TagVisibleOnThumbnail(): Promise<boolean> {
    logger.elementInteraction('verify', 'Top 10 tag on the thumbnail');
    const badgeLocator = this.page.locator(this.top10BadgeLocator.selector).first();
    if (!(await badgeLocator.count())) {
      return false;
    }
    await badgeLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await badgeLocator.isVisible().catch(() => false);
  }

  async isMidRailBannerAdlVisible(): Promise<boolean> {
    await this.page.waitForTimeout(3000);
    logger.elementInteraction('verify', 'mid rail banner adl');
    const locator = this.page.locator(this.gptBannerAdLocator.selector).first();
    if (!(await locator.count())) {
      return false;
    }
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await locator.isVisible().catch(() => false);
  }

  async scrollUntilGoogleAdsMidRailBannerVisible(maxScrolls: number = 15): Promise<boolean> {
    const bannerLocator = this.page.locator(this.googleAdsIframeLocator.selector).first();
    for (let attempt = 0; attempt < maxScrolls; attempt += 1) {
      if (await bannerLocator.isVisible().catch(() => false)) {
        return true;
      }
      await this.page.mouse.wheel(0, 700).catch(() => undefined);
      await this.page.waitForTimeout(1000);
    }
    return await bannerLocator.isVisible().catch(() => false);
  }

  async isGoogleAdsMidRailBannerVisible(): Promise<boolean> {
    await this.page.waitForTimeout(3000);
    logger.elementInteraction('verify', 'Google Ads mid rail banner');
    const locator = this.page.locator(this.googleAdsIframeLocator.selector);
    if (!(await locator.count())) {
      return false;
    }
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => undefined);
    return await locator.isVisible().catch(() => false);
  }

  async scrollTillSponsoredRail(maxScrolls: number = 15): Promise<void> {
    logger.elementInteraction('scroll', 'Sponsored Rail content');
    const sponsoredRailLocator = this.page.locator(this.sponsoredRailLocator.selector).first();
    for (let attempt = 0; attempt < maxScrolls; attempt += 1) {
      if (await sponsoredRailLocator.count().catch(() => 0) > 0) {
        await sponsoredRailLocator.scrollIntoViewIfNeeded().catch(() => undefined);
        break;
      }
      await this.page.mouse.wheel(0, 500).catch(() => undefined);
      await this.page.waitForTimeout(800);
    }
    await this.page.waitForTimeout(2000);
  }

  async isSponsoredRailVisible(): Promise<boolean> {
    logger.elementInteraction('verify', 'Sponsored Rail visibility');
    const sponsoredRailLocator = this.page.locator(this.sponsoredRailLocator.selector).first();
    if (!(await sponsoredRailLocator.count().catch(() => 0) > 0)) {
      return false;
    }
    await sponsoredRailLocator.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForTimeout(1000);
    return await sponsoredRailLocator.isVisible().catch(() => false);
  }

  async isSponsoredRailAdvertiserLogoVisible(): Promise<boolean> {
    logger.elementInteraction('verify', 'Sponsored Rail advertiser logo');
    const advertiserLogoLocator = this.page.locator(this.sponsoredRailAdvertiserLogoLocator.selector).first();
    if (!(await advertiserLogoLocator.count().catch(() => 0) > 0)) {
      return false;
    }
    await advertiserLogoLocator.scrollIntoViewIfNeeded().catch(() => undefined);
    await advertiserLogoLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
    return await advertiserLogoLocator.isVisible().catch(() => false);
  }

  async clickOnSponsoredRailNonContentArea(): Promise<void> {
    logger.elementInteraction('click', 'Sponsored Rail non-content area (title)');
    const nonContentAreaLocator = this.page.locator(this.sponsoredRailNonContentAreaLocator.selector).first();
    if (!(await nonContentAreaLocator.count().catch(() => 0) > 0)) {
      logger.debug('Sponsored Rail non-content area not found');
      return;
    }
    await nonContentAreaLocator.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.page.waitForTimeout(500);
    await nonContentAreaLocator.click({ timeout: 10000 }).catch(() => undefined);
    await this.page.waitForTimeout(2000);
  }
}
