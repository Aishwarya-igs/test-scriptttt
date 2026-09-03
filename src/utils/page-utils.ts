import { Page, Locator, expect } from '@playwright/test';
import { PageElement } from '../../src/types/index';
import { logger } from './logger';

/**
 * Enhanced page utilities for common UI interactions
 */
export class PageUtils {
  // eslint-disable-next-line no-unused-vars
  constructor(private page: Page) { }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout }).catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
  }

  /**
   * Safe click with automatic waiting
   */
  async safeClick(element: PageElement, timeout: number = 30000): Promise<void> {
    const locator = this.getLocator(element);
    // await locator.waitFor({ state: 'visible', timeout });
    // await locator.waitFor({ state: 'attached', timeout });
    await locator.click({ timeout });
    logger.info(`Clicked on element : ${element.selector || element.text || element.testId}`);
  }

  /**
   * Safe type with automatic clearing
   */
  async safeType(element: PageElement, text: string, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.clear();
    await locator.fill(text);
    logger.info(`Typed ${text} into element : ${element.selector || element.text || element.testId}`);
  }

  /**
   * Get text content with waiting
   */
  async getTextContent(element: PageElement, timeout: number = 10000): Promise<string> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(element: PageElement, timeout: number = 10000): Promise<boolean> {
    try {
      const locator = this.getLocator(element);
      await locator.waitFor({ state: 'attached', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(element: PageElement): Promise<void> {
    const locator = this.getLocator(element);
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot of specific element
   */
  async takeElementScreenshot(element: PageElement, path: string): Promise<void> {
    const locator = this.getLocator(element);
    await locator.screenshot({ path });
  }

  /**
   * Get locator from PageElement definition
   */
  private getLocator(element: PageElement): Locator {
    if (element.selector) {
      return this.page.locator(element.selector);
    }
    if (element.testId) {
      return this.page.getByTestId(element.testId);
    }
    if (element.role && element.text) {
      return this.page.getByRole(element.role as 'button' | 'link' | 'textbox', { name: element.text });
    }
    if (element.text) {
      return this.page.getByText(element.text, { exact: true });
    }
    return this.page.locator('');
  }

  /**
   * Hover over element
   */
  async hover(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.hover();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(element: PageElement, value: string | string[], timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.selectOption(value);
  }

  /**
   * Upload file to input element
   */
  async uploadFile(element: PageElement, filePath: string | string[], timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await locator.waitFor({ state: 'visible', timeout });
    await locator.setInputFiles(filePath);
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(source: PageElement, target: PageElement): Promise<void> {
    const sourceLocator = this.getLocator(source);
    const targetLocator = this.getLocator(target);
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
  }

  /**
   * Get element count
   */
  async getElementCount(element: PageElement): Promise<number> {
    const locator = this.getLocator(element);
    return await locator.count();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(element: PageElement, text: string, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toContainText(text, { timeout });
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Assert element is hidden
   */
  async assertElementHidden(element: PageElement, timeout: number = 10000): Promise<void> {
    const locator = this.getLocator(element);
    await expect(locator).toBeHidden({ timeout });
  }

  async parameterizeSelector(element: string | PageElement, params: Record<string, string>): Promise<Locator> {
    let selector =
      typeof element === 'string'
        ? element
        : element.selector;
    Object.entries(params).forEach(([key, value]) => {
      selector = selector.replace(
        new RegExp(`\\{${key}\\}`, 'g'),
        value
      );
    });
    return this.page.locator(selector);
  }

  /**
   * Mobile-only horizontal scroll helper for rail/list containers.
   * Finds the actual scrollable ancestor and calls native scrollTo on it.
   * This avoids coordinate-based dragging and works for mobile web rails.
   */
  async scrollHorizontallyMobile(
    element: string | Locator,
    direction: 'left' | 'right' = 'right',
    distance: number = 320,
    waitMs: number = 500
  ): Promise<boolean> {
    const locator = typeof element === 'string' ? this.page.locator(element) : element;
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    const box = await locator.boundingBox();
    if (!box) return false;
    // Keep swipe path well inside the rail bounds to avoid tapping edge cards.
    const startX = direction === 'right' ? box.x + box.width * 0.8 : box.x + box.width * 0.2;
    const endX = direction === 'right' ? startX - distance : startX + distance;
    const y = box.y + box.height / 2;
    const client = await this.page.context().newCDPSession(this.page);
    const point = (x: number, yy: number) => [{ x, y: yy, radiusX: 5, radiusY: 5, force: 1, id: 1 }];
    try {
      await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(startX, y) });
      await this.page.waitForTimeout(50); // small delay mimics a real finger-down pause
      const steps = 15;
      for (let i = 1; i <= steps; i++) {
        const x = startX + ((endX - startX) * i) / steps;
        await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(x, y) });
        await this.page.waitForTimeout(12);
      }
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } finally {
      await client.detach().catch(() => undefined);
    }
    await this.page.waitForTimeout(waitMs);
    return true;
  }
}