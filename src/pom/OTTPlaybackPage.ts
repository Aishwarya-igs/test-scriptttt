import { Page } from '@playwright/test';
import { PageUtils } from '../utils/page-utils';
import { PageElement } from '../types/index';
import { logger } from '../utils/logger';
import { config } from '../utils/config-manager';

export class OTTPlaybackPage {
    private readonly page: Page;
    private readonly pageUtils: PageUtils;
    private readonly cookieConfirmButton: PageElement;
    private readonly emailField: PageElement;
    private readonly passwordField: PageElement;
    private readonly continueButton: PageElement;
    private readonly homeTab: PageElement;
    private readonly showsTab: PageElement;
    private readonly moviesTab: PageElement;
    private readonly gmaTab: PageElement;
    private readonly homeScreenContent: PageElement;
    private readonly contentCard: PageElement;
    private readonly playButton: PageElement;
    private readonly subscribeButton: PageElement;
    private readonly playerContainer: PageElement;
    private readonly videoElement: PageElement;
    private readonly premiumGateMessage: PageElement;
    private readonly maybeLaterButton: PageElement;
    private readonly subscribeToWatchButton: PageElement;
    private readonly laterEpisodeButton: PageElement;
    private readonly liveTvNavLink: PageElement;
    private readonly liveTvChannelCard: PageElement;
    private readonly pauseButton: PageElement;
    private readonly playResumeButton: PageElement;
    private readonly tfcAsiaImage: PageElement;
    private readonly watchlistNavLink: PageElement;
    private readonly watchlistContentItem: PageElement;
    private readonly watchlistPlayButton: PageElement;
    private readonly paidContentBadge: PageElement;
    private readonly subscribePromptText: PageElement;
    private readonly seekBar: PageElement;
    private readonly titleSelector: PageElement;
    private readonly episodeSelector: PageElement;
    private readonly unlockEarlyAccessButton: PageElement;
    private readonly updateToWatchNowButton: PageElement;
    private readonly progressBarContainer: PageElement;
    private readonly progressBarIndicator: PageElement;

    constructor(page: Page) {
        this.page = page;
        this.pageUtils = new PageUtils(page);
        this.cookieConfirmButton = { role: 'button', text: 'Confirm', selector: 'button:has-text("Confirm")' };
        this.emailField = { selector: 'input[placeholder="Email Address"], input[type="email"], input[name*="email"]' };
        this.passwordField = { selector: 'input[placeholder="Password"], input[type="password"], input[name*="password"]' };
        this.continueButton = { role: 'button', text: 'Continue', selector: 'button:has-text("Continue")' };
        this.homeTab = { text: 'Home', selector: 'nav >> text=Home' };
        this.showsTab = { text: 'Shows', selector: 'nav >> text=Shows' };
        this.moviesTab = { text: 'Movies', selector: 'nav >> text=Movies' };
        this.gmaTab = { text: 'GMA', selector: 'nav >> text=GMA' };
        this.homeScreenContent = { selector: 'main >> text=/Stream the best Filipino movies|Continue Watching/' };
        this.contentCard = { selector: 'a[href*="/player/"], [data-testid*="content"], [data-testid*="card"], .thumbnail, .poster, [class*="poster"], [class*="thumbnail"]' };
        this.playButton = { text: 'Play', selector: 'button:has-text("Play"), a:has-text("Play"), [aria-label*="Play"]' };
        this.subscribeButton = { text: 'Subscribe', selector: 'button:has-text("Subscribe"), a:has-text("Subscribe"), [aria-label*="Subscribe"]' };
        this.playerContainer = { selector: 'video, [data-testid*="player"], [class*="player"], [id*="player"]' };
        this.videoElement = { selector: 'video' };
        this.premiumGateMessage = { selector: 'h2', text: 'A valid subscription is required to view this content. Please subscribe or renew your plan.' };
        this.maybeLaterButton = { text: 'Maybe Later', selector: 'text=Maybe Later' };
        this.subscribeToWatchButton = { text: 'Subscribe to watch', selector: 'text=/Subscribe to watch/i' };
        this.laterEpisodeButton = { text: 'Play S1 E6', selector: 'text=/Play S1 E[6-9]|Play S[0-9]+ E[6-9]/i' };
        this.liveTvNavLink = { text: 'Live TV', selector: 'text=/Live TV/i' };
        this.liveTvChannelCard = { selector: 'a[href*="/live"], a[href*="/tv"], [data-testid*="channel"], [class*="channel"], button:has-text("Play")' };
        this.pauseButton = { role: 'button', text: 'Pause', selector: 'button:has-text("Pause")' };
        this.playResumeButton = { role: 'button', text: 'Play', selector: 'button:has-text("Play")' };
        this.tfcAsiaImage = { role: 'img', text: 'TFC Asia', selector: 'img[alt*="TFC Asia"], img[alt*="TFC"], img[title*="TFC Asia"]' };
        this.watchlistNavLink = { text: 'My Watchlist', selector: 'text=/My Watchlist|Watchlist/i' };
        this.watchlistContentItem = { selector: 'a[href*="/player/"], a[href*="/detail"], [data-testid*="watchlist"], [class*="watchlist"] a, [class*="poster"], [class*="thumbnail"]' };
        this.watchlistPlayButton = { selector: 'button:has-text("Play"), button:has-text("Resume"), a:has-text("Play"), a:has-text("Resume"), [aria-label*="Play"], [aria-label*="Resume"]' };
        this.paidContentBadge = { selector: 'img[alt*="paid"], [alt*="paid"], [data-testid*="paid"]' };
        this.subscribePromptText = { selector: 'text=/Subscribe to watch|Subscribe to Watch/i' };
        this.seekBar = { selector: '.player-progress-indicator' };
        this.titleSelector = { selector: '[data-testid="player-title"], .player-title, .video-title, .player-header h1, h1' };
        this.episodeSelector = { selector: '[data-testid="episode-title"], .episode-title, .player-episode, h2:has-text("Episode")' };
        this.unlockEarlyAccessButton = { selector: '//div[text()="Unlock Early Access"]' };
        this.updateToWatchNowButton = { selector: '//p[text()="Upgrade to Watch Now"]' };
        this.progressBarContainer = { selector: "//div[contains(@class,'player-progress-container')]" };
        this.progressBarIndicator = { selector: "//div[@class='player-progress-indicator']" };
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto(config.getBaseURL());
        await this.pageUtils.waitForPageLoad();
    }

    async navigateToTab(tabName: string): Promise<boolean> {
        const tabMap: Record<string, PageElement> = {
            Home: this.homeTab,
            Shows: this.showsTab,
            Movies: this.moviesTab,
            GMA: this.gmaTab,
        };
        const targetTab = tabMap[tabName];
        if (!targetTab) {
            return false;
        }
        try {
            await this.pageUtils.safeClick(targetTab, 15000);
            await this.pageUtils.waitForNetworkIdle(60000);
            await this.page.waitForTimeout(3000);
            return true;
        } catch {
            return false;
        }
    }

    async acceptCookieSettingsIfVisible(): Promise<void> {
        try {
            const isVisible = await this.pageUtils.isVisible(this.cookieConfirmButton, 2000);
            if (isVisible) {
                logger.step('Accepting cookie settings popup');
                await this.pageUtils.safeClick(this.cookieConfirmButton);
            }
        } catch (error) {
            logger.debug('Cookie confirmation button not visible', error);
        }
    }

    async loginWithFreeUser(email: string, password: string): Promise<void> {
        await this.navigateToHomePage();
        await this.acceptCookieSettingsIfVisible();
        try {
            await this.page.getByRole('button', { name: /confirm/i }).first().click({ force: true, timeout: 5000 });
        } catch {
            // ignore if overlay already dismissed
        }
        await this.pageUtils.safeClick(this.emailField);
        await this.pageUtils.safeType(this.emailField, email);
        await this.pageUtils.safeClick(this.passwordField);
        await this.pageUtils.safeType(this.passwordField, password);
        await this.pageUtils.safeClick(this.continueButton);
        await this.pageUtils.waitForNetworkIdle(60000);
        await this.page.waitForTimeout(5000);
    }

    async isHomeScreenReady(): Promise<boolean> {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            const mainVisible = await this.page.locator(this.homeScreenContent.selector).first().isVisible().catch(() => false);
            const tabVisible = await this.pageUtils.isVisible(this.homeTab, 15000);
            return mainVisible || tabVisible;
        } catch {
            return false;
        }
    }

    async isHomeTabVisible(): Promise<boolean> {
        return await this.pageUtils.isVisible(this.homeTab, 15000);
    }

    async hoverFirstPlayableContentCard(): Promise<boolean> {
        const playTarget = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
        const isVisible = await playTarget.isVisible().catch(() => false);
        if (!isVisible) {
            return false;
        }
        await playTarget.scrollIntoViewIfNeeded();
        await playTarget.hover();
        return true;
    }

    async clickFirstAvailablePlayButton(timeout: number = 15000): Promise<boolean> {
        const playTarget = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
        const isVisible = await playTarget.isVisible().catch(() => false);
        if (!isVisible) {
            return false;
        }
        await playTarget.click({ force: true });
        await this.page.waitForURL(/\/player\//, { timeout }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);
        await this.page.waitForTimeout(8000);
        return true;
    }

    async clickFirstPremiumContentCard(): Promise<boolean> {
        const cardCandidates = this.page
            .locator('div.thumbnail')
            .filter({ has: this.page.locator('img[alt], img[title]') })
            .filter({ hasNot: this.page.locator('img[alt*="arrow"], img[alt*="logo"], img[alt*="icon"], img[title*="arrow"], img[title*="logo"], img[title*="icon"]') });
        const cardCount = await cardCandidates.count().catch(() => 0);
        for (let index = 0; index < Math.min(8, cardCount); index += 1) {
            const card = cardCandidates.nth(index);
            const visible = await card.isVisible().catch(() => false);
            if (!visible) {
                continue;
            }
            await card.scrollIntoViewIfNeeded().catch(() => undefined);
            await card.hover().catch(() => undefined);
            await card.dblclick({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => undefined);
            await this.page.waitForTimeout(1500);
            const navigated = await this.page.waitForURL(/\/player\/|\/show\/|\/movie\/|\/detail\//, { timeout: 5000 }).catch(() => false);
            if (navigated) {
                return true;
            }
            const detailsHeadingVisible = await this.page.locator('main h1').first().isVisible().catch(() => false);
            if (detailsHeadingVisible) {
                return true;
            }
        }
        return false;
    }

    async clickSubscribeOrSubscribeToWatchButton(): Promise<boolean> {
        const subscribeTargets = this.page.locator('button, a, [role="button"]').filter({ hasText: /subscribe/i });
        const targetCount = await subscribeTargets.count().catch(() => 0);
        for (let index = 0; index < Math.min(targetCount, 10); index += 1) {
            const target = subscribeTargets.nth(index);
            const targetVisible = await target.isVisible().catch(() => false);
            if (!targetVisible) {
                continue;
            }
            await target.scrollIntoViewIfNeeded();
            await target.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(4000);
            return true;
        }
        return false;
    }

    async clickLaterEpisodeFromPremiumContent(): Promise<boolean> {
        const episodeItems = this.page.locator('.episodes-list .episode-info, .episodes-list [data-testid*="episode"], .seasons-container .episode-info, .episodes-list li, [data-testid*="episode-item"]');
        const itemsCount = await episodeItems.count().catch(() => 0);
        if (itemsCount > 0) {
            const targetIndex = Math.min(4, Math.max(0, itemsCount - 1));
            const item = episodeItems.nth(targetIndex);
            const itemVisible = await item.isVisible().catch(() => false);
            if (!itemVisible) {
                return false;
            }
            const clickable = item.locator('img, button, a, [role="button"]').first();
            const clickableVisible = await clickable.isVisible().catch(() => false);
            if (clickableVisible) {
                await clickable.scrollIntoViewIfNeeded();
                await clickable.click({ force: true, timeout: 30000 }).catch(() => undefined);
            } else {
                await item.scrollIntoViewIfNeeded();
                await item.click({ force: true, timeout: 30000 }).catch(() => undefined);
            }
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        }
        const episodeButton = this.page.getByText(/Play\s*S\d+\s*E([5-9]|[1-9]\d+)/i).first();
        const isVisible = await episodeButton.isVisible().catch(() => false);
        if (!isVisible) {
            const fallbackButton = this.page.getByText(/Play/i).filter({ hasNotText: /Subscribe/i }).first();
            const fallbackVisible = await fallbackButton.isVisible().catch(() => false);
            if (!fallbackVisible) {
                return false;
            }
            await fallbackButton.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        }
        await episodeButton.click({ force: true, timeout: 30000 }).catch(() => undefined);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
        await this.page.waitForTimeout(5000);
        return true;
    }

    async clickHomePagePaidContentCard(): Promise<boolean> {
        const paidBadges = this.page.locator('img[alt*="paid"], [alt*="paid"], [data-testid*="paid"], [class*="paid"]');
        const paidCount = await paidBadges.count().catch(() => 0);
        for (let index = 0; index < Math.min(paidCount, 8); index += 1) {
            const badge = paidBadges.nth(index);
            const badgeVisible = await badge.isVisible().catch(() => false);
            if (!badgeVisible) {
                continue;
            }
            const clicked = await badge.evaluate((node: HTMLElement) => {
                let current = node.parentElement;
                while (current) {
                    const tagName = current.tagName.toLowerCase();
                    const hasClickableRole = current.getAttribute('role') === 'button';
                    const hasHref = !!current.getAttribute('href');
                    if (tagName === 'a' || tagName === 'button' || hasClickableRole || hasHref) {
                        current.scrollIntoView({ block: 'center' });
                        current.click();
                        return true;
                    }
                    current = current.parentElement;
                }
                node.scrollIntoView({ block: 'center' });
                (node as HTMLElement).click();
                return true;
            });
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return clicked;
        }
        return false;
    }

    async tryHomePageContentForSubscribeCTA(): Promise<{ found: boolean; message: string; maybeLaterVisible: boolean; subscribeToWatchVisible: boolean; premiumGateVisible: boolean }> {
        await this.pageUtils.waitForNetworkIdle(60000);
        const paidIndicators = this.page.locator(this.paidContentBadge.selector);
        const paidCount = await paidIndicators.count().catch(() => 0);
        for (let index = 0; index < Math.min(paidCount, 6); index += 1) {
            const paidIndicator = paidIndicators.nth(index);
            const indicatorVisible = await paidIndicator.isVisible().catch(() => false);
            if (!indicatorVisible) {
                continue;
            }
            await paidIndicator.hover({ force: true }).catch(() => undefined);
            await this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => undefined);
            await this.pageUtils.waitForNetworkIdle(60000);
            await this.page.waitForTimeout(3000);
            const premiumGateVisible = await this.isPremiumContentGateVisible();
            const maybeLaterVisible = await this.isMaybeLaterVisible();
            const subscribeToWatchVisible = await this.isSubscribeToWatchVisible();
            const message = premiumGateVisible ? await this.getPremiumGateMessageText() : (subscribeToWatchVisible ? 'Subscribe to watch' : '');
            if (premiumGateVisible || maybeLaterVisible || subscribeToWatchVisible) {
                return {
                    found: true,
                    message,
                    maybeLaterVisible,
                    subscribeToWatchVisible,
                    premiumGateVisible,
                };
            }
        }
        return {
            found: false,
            message: '',
            maybeLaterVisible: false,
            subscribeToWatchVisible: false,
            premiumGateVisible: false,
        };
    }

    async isPremiumContentGateVisible(): Promise<boolean> {
        const promptText = await this.page.locator('body').innerText().catch(() => '');
        return promptText.toLowerCase().includes('a valid subscription is required to view this content') || await this.pageUtils.isVisible(this.premiumGateMessage, 20000);
    }

    async getPremiumGateMessageText(): Promise<string> {
        const promptText = await this.page.locator('body').innerText().catch(() => '');
        const match = promptText.match(/A valid subscription is required to view this content[^\n]*/i);
        if (match) {
            return match[0];
        }
        return await this.pageUtils.getTextContent(this.premiumGateMessage, 20000);
    }

    async isMaybeLaterVisible(): Promise<boolean> {
        const bodyText = await this.page.locator('//p[text()="Maybe Later"]').innerText().catch(() => '');
        return bodyText.toLowerCase().includes('maybe later') || await this.pageUtils.isVisible(this.maybeLaterButton, 10000);
    }

    async clickMaybeLaterButton(): Promise<boolean> {
        logger.elementInteraction('click', 'Maybe Later button');
        try {
            const locator = this.page.locator(this.maybeLaterButton.selector).first();
            await locator.waitFor({ state: 'visible', timeout: 15000 });
            await locator.click({ timeout: 15000 });
            return true;
        } catch (error) {
            logger.debug('Maybe Later button click failed', error);
            return false;
        }
    }

    async isUnlockEarlyAccessVisible(): Promise<boolean> {
       const bodyText = await this.page.locator('body').innerText().catch(() => '');
        return bodyText.toLowerCase().includes('unlock early access') || await this.pageUtils.isVisible(this.unlockEarlyAccessButton, 10000);
    }

    async isUpdateToWatchNowVisible(): Promise<boolean> {
        const bodyText = await this.page.locator('body').innerText().catch(() => '');
        return bodyText.toLowerCase().includes('update to watch now') || await this.pageUtils.isVisible(this.updateToWatchNowButton, 10000);
    }

    async clickUpdateToWatchNowButton(): Promise<boolean> {
        logger.elementInteraction('click', 'Update to Watch now button');
        try {
            const locator = this.page.locator(this.updateToWatchNowButton.selector).first();
            await locator.waitFor({ state: 'visible', timeout: 15000 });
            await locator.click({ timeout: 15000, force: true });
            return true;
        } catch (error) {
            logger.debug('Update to Watch now button click failed', error);
            try {
                const fallbackLocator = this.page.getByText(/Update to Watch now/i).first();
                if (await fallbackLocator.count()) {
                    await fallbackLocator.click({ timeout: 15000, force: true });
                    return true;
                }
            } catch (fallbackError) {
                logger.debug('Update to Watch now fallback click failed', fallbackError);
            }
            return false;
        }
    }

    async isSubscribeToWatchVisible(): Promise<boolean> {
        const bodyText = await this.page.locator('body').innerText().catch(() => '');
        return bodyText.toLowerCase().includes('subscribe to watch') || await this.pageUtils.isVisible(this.subscribeToWatchButton, 10000);
    }

    async isPlaybackStarted(): Promise<boolean> {
        try {
            await this.page.waitForURL(/\/player\//, { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            const videoVisible = await this.page.locator(this.videoElement.selector).first().isVisible().catch(() => false);
            const playerVisible = await this.page.locator(this.playerContainer.selector).first().isVisible().catch(() => false);
            const playerUrl = this.page.url();
            return videoVisible || playerVisible || playerUrl.includes('/player/');
        } catch {
            return false;
        }
    }

    async selectLiveTVSection(): Promise<boolean> {
        try {
            const tfcImage = this.page.getByRole('img', { name: 'TFC Asia' }).first();
            await tfcImage.waitFor({ state: 'visible', timeout: 30000 });
            await tfcImage.click({ force: true, timeout: 30000 });
            await this.page.waitForTimeout(10000);
            return true;
        } catch {
            return false;
        }
    }

    async selectLiveChannel(): Promise<boolean> {
        return await this.selectLiveTVSection();
    }

    async navigateToWatchlistPage(): Promise<boolean> {
        try {
            const watchlistLink = this.page.getByText(/#my_watchlist|Watchlist/i).first();
            await watchlistLink.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
            await watchlistLink.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        } catch {
            return false;
        }
    }

    async selectFirstWatchlistContent(): Promise<boolean> {
        try {
            const watchlistContent = this.page.locator(this.watchlistContentItem.selector).first();
            await watchlistContent.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
            await watchlistContent.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            return true;
        } catch {
            return false;
        }
    }

    async clickWatchlistPlayOrResume(): Promise<boolean> {
        try {
            const playButton = this.page.locator(this.watchlistPlayButton.selector).first();
            await playButton.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
            await playButton.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            return true;
        } catch {
            return false;
        }
    }

    async waitForWatchlistPlayback(): Promise<{ playbackStarted: boolean; playbackCompleted: boolean; currentTime: number; duration: number }> {
        try {
            await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            const videoElement = this.page.locator(this.videoElement.selector).first();
            const videoVisible = await videoElement.isVisible().catch(() => false);
            const playerVisible = await this.page.locator(this.playerContainer.selector).first().isVisible().catch(() => false);
            const currentTime = await videoElement.evaluate((node: HTMLVideoElement) => node.currentTime).catch(() => 0);
            const duration = await videoElement.evaluate((node: HTMLVideoElement) => node.duration).catch(() => 0);
            const playbackCompleted = await videoElement.evaluate((node: HTMLVideoElement) => node.ended).catch(() => false);
            const playbackStarted = videoVisible || playerVisible || currentTime > 0 || duration > 0 || this.page.url().includes('/player/');
            return { playbackStarted, playbackCompleted, currentTime, duration };
        } catch {
            return { playbackStarted: false, playbackCompleted: false, currentTime: 0, duration: 0 };
        }
    }

    async waitForPlaybackToStart(timeout: number = 40000): Promise<boolean> {
        try {
            await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            const videoElement = this.page.locator(this.videoElement.selector).first();
            const videoVisible = await videoElement.isVisible().catch(() => false);
            const pauseVisible = await this.page.getByRole('button', { name: /pause/i }).first().isVisible().catch(() => false);
            const playVisible = await this.page.getByRole('button', { name: /play/i }).first().isVisible().catch(() => false);
            return videoVisible || pauseVisible || playVisible || this.page.url().includes('/player/');
        } catch {
            return false;
        }
    }

    async pauseAndResumePlayback(): Promise<{ pauseClicked: boolean; resumeClicked: boolean; playbackCompleted: boolean; currentTimeBeforePause: number; currentTimeAfterResume: number }> {
        const videoElement = this.page.locator(this.videoElement.selector).first();
        let pauseClicked = false;
        let resumeClicked = false;
        let playbackCompleted = false;
        const currentTimeBeforePause = await videoElement.evaluate((node: HTMLVideoElement) => node.currentTime).catch(() => 0);
        await this.page.waitForTimeout(5000);
        await this.page.mouse.move(700, 400).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        const pauseButton = this.page.getByRole('button', { name: 'Pause' }).first();
        await pauseButton.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
        if (await pauseButton.isVisible().catch(() => false)) {
            await pauseButton.hover({ force: true }).catch(() => undefined);
            await this.page.waitForTimeout(1000);
            await pauseButton.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForTimeout(8000);
            pauseClicked = true;
        }
        await this.page.mouse.move(700, 400).catch(() => undefined);
        await this.page.waitForTimeout(2000);
        const playButton = this.page.getByRole('button', { name: 'Play' }).first();
        await playButton.waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
        if (await playButton.isVisible().catch(() => false)) {
            await playButton.hover({ force: true }).catch(() => undefined);
            await this.page.waitForTimeout(1000);
            await playButton.click({ force: true, timeout: 30000 }).catch(() => undefined);
            await this.page.waitForTimeout(5000);
            resumeClicked = true;
        }
        const currentTimeAfterResume = await videoElement.evaluate((node: HTMLVideoElement) => node.currentTime).catch(() => 0);
        playbackCompleted = await videoElement.evaluate((node: HTMLVideoElement) => node.ended).catch(() => false);
        return {
            pauseClicked,
            resumeClicked,
            playbackCompleted,
            currentTimeBeforePause,
            currentTimeAfterResume,
        };
    }

    async dragSeekBarToPosition(targetPercent: number): Promise<void> {
        const seekBar = this.page.locator(this.seekBar.selector).first();
        await seekBar.waitFor({ state: 'visible', timeout: 15000 });
        const box = await seekBar.boundingBox();
        if (!box) {
        return;
        }
        const startX = box.x + box.width * 0.2;
        const startY = box.y + box.height / 2;
        const endX = box.x + box.width * Math.min(Math.max(targetPercent, 0.05), 0.95);
        const endY = startY;
        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(endX, endY, { steps: 8 });
        await this.page.mouse.up();
  }

    async dragProgressBarToPosition(targetPercent: number): Promise<void> {
        const candidates = [this.progressBarContainer, this.progressBarIndicator, this.seekBar];
        let targetLocator = null as any;
        for (const candidate of candidates) {
            const locator = this.page.locator(candidate.selector).first();
            const count = await locator.count().catch(() => 0);
            if (count > 0) {
                const visible = await locator.isVisible().catch(() => false);
                if (visible) {
                    targetLocator = locator;
                    break;
                }
            }
        }
        if (!targetLocator) {
            return;
        }
        const box = await targetLocator.boundingBox().catch(() => null);
        if (!box) {
            return;
        }
        const safePercent = Math.min(Math.max(targetPercent, 0.05), 0.99);
        const startX = box.x + box.width * 0.05;
        const startY = box.y + box.height / 2;
        const endX = box.x + box.width * safePercent;
        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(endX, startY, { steps: 30 });
        await this.page.mouse.up();
        await this.page.waitForTimeout(1000);
    }
}
