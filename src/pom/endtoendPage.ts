import { Page, selectors } from '@playwright/test';
import { PageElement } from '../types/index';

export class EndToEndPage {
  private readonly page: Page;
  private readonly genreText: PageElement;
  private readonly ratingText: PageElement;
  private readonly playerQualityText: PageElement;
  private readonly contentDescriptionText: PageElement;
  private readonly playButton: PageElement;
  private readonly resumeButton: PageElement;
  private readonly shareIcon: PageElement;
  private readonly pausePlayButton: PageElement;
  private readonly logoIcon: PageElement;

  constructor(page: Page) {
    this.page = page;
    this.genreText = { selector: '//div[contains(@class,"genre")]//p' };
    this.ratingText = { selector: '//div[contains(@class,"age-rating")]//p' };
    this.playerQualityText = { selector: '//div[contains(@class,"video-quality")]//p' };
    this.contentDescriptionText = { selector: '//div[contains(@class,"desc")]' };
    // this.playButton = { selector: '//div[@id="play"]' };
    this.playButton = { selector: '//*[@id="player-container-main-playPauseButton"]' };
    // this.playButton = { selector: '#play div' };
    this.logoIcon = { selector: '.logo' }
    this.resumeButton = { selector: '//*[@id="player-container-main-playPauseButton"]/img' };
    this.shareIcon = { selector: '//*[@id="share"]' };
    this.pausePlayButton = { selector: 'button[aria-label*=pause], button[aria-label*=play], [data-testid*=pause], [data-testid*=play]' };
  }

  async isGenreVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.genreText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isRatingVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.ratingText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isPlayerQualityVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playerQualityText.selector).getByText(/\b(?:4k|1080p|720p|480p|hd|uhd)\b/i).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isContentDescriptionVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.contentDescriptionText.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async isPlayButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isResumeButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.playButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isShareIconVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.shareIcon.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isPausePlayButtonVisible(): Promise<boolean> {
    try {
      const locator = this.page.locator(this.pausePlayButton.selector).first();
      await locator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined);
      return await locator.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async scrollUntilElementVisible() {
    await this.scrollUntilVisible(this.logoIcon.selector)
  }

  async scrollUntilVisible(selector: string): Promise<void> {
    const locator = this.page.locator(selector);
    while (!(await locator.isVisible())) {
      // Smoothly scroll 100px
      await this.page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          const start = window.scrollY;
          const target = start + 100;
          const duration = 500; // milliseconds
          const startTime = performance.now();
          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, start + (target - start) * progress);
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          }
          requestAnimationFrame(animate);
        });
      });
      // Pause before checking
      await this.page.waitForTimeout(500);
      if (await locator.isVisible()) {
        break;
      }
    }
    await locator.scrollIntoViewIfNeeded();
  }
}
