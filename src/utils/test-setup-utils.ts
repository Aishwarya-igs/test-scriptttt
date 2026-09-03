import { Page, BrowserContext, Browser } from '@playwright/test';
import * as fs from 'fs';
import { Logger } from './logger';

/**
 * Test setup and teardown utilities following best practices
 */
export class TestSetupUtils {
  private static logger = Logger.getInstance();

  /**
   * Setup test environment with authentication and data preparation
   */
  static async setupTestEnvironment(
    page: Page,
    options: {
      clearCookies?: boolean;
      clearLocalStorage?: boolean;
      clearSessionStorage?: boolean;
      setViewport?: { width: number; height: number };
      mockAPIs?: Array<{ url: string; response: any }>;
    } = {},
  ): Promise<void> {
    this.logger.info('Setting up test environment');

    try {
      // Clear browser data if requested
      if (options.clearCookies) {
        await page.context().clearCookies();
      }

      if (options.clearLocalStorage || options.clearSessionStorage) {
        await page.evaluate(({ clearLocal, clearSession }) => {
          if (clearLocal) localStorage.clear();
          if (clearSession) sessionStorage.clear();
        }, {
          clearLocal: options.clearLocalStorage,
          clearSession: options.clearSessionStorage,
        });
      }

      // Set viewport if specified
      if (options.setViewport) {
        await page.setViewportSize(options.setViewport);
      }

      // Setup API mocking if specified
      if (options.mockAPIs) {
        for (const mock of options.mockAPIs) {
          await page.route(mock.url, route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mock.response),
          }));
        }
      }

      this.logger.info('Test environment setup completed');
    } catch (error) {
      this.logger.error('Failed to setup test environment', error);
      throw error;
    }
  }

  /**
   * Perform user authentication with enhanced error handling
   */
  static async authenticateUser(
    page: Page,
    credentials: {
      username: string;
      password: string;
      loginUrl?: string;
      usernameSelector?: string;
      passwordSelector?: string;
      submitSelector?: string;
      successUrl?: string;
    },
  ): Promise<void> {
    this.logger.info(`Authenticating user: ${credentials.username}`);

    try {
      const loginUrl = credentials.loginUrl || '/login';
      const usernameSelector = credentials.usernameSelector || '[data-testid="username"], input[type="email"], input[name="username"]';
      const passwordSelector = credentials.passwordSelector || '[data-testid="password"], input[type="password"], input[name="password"]';
      const submitSelector = credentials.submitSelector || '[data-testid="login-button"], button[type="submit"], input[type="submit"]';
      const successUrl = credentials.successUrl || '**/dashboard';

      // Navigate to login page
      await page.goto(loginUrl);
      await page.waitForLoadState('networkidle');

      // Fill credentials
      await page.fill(usernameSelector, credentials.username);
      await page.fill(passwordSelector, credentials.password);

      // Submit login form
      await page.click(submitSelector);

      // Wait for successful authentication
      await page.waitForURL(successUrl, { timeout: 15000 });

      this.logger.info(`Successfully authenticated user: ${credentials.username}`);
    } catch (error) {
      this.logger.error(`Failed to authenticate user: ${credentials.username}`, error);
      // Take screenshot for debugging
      await page.screenshot({ path: `screenshots/auth-error-${Date.now()}.png` });
      throw error;
    }
  }

  /**
   * Setup test data with validation
   */
  static async setupTestData(
    testDataConfig: {
      users?: any[];
      products?: any[];
      orders?: any[];
      customData?: Record<string, any>;
    },
  ): Promise<Record<string, any>> {
    this.logger.info('Setting up test data');

    try {
      const testData: Record<string, any> = {};

      // Validate and setup users
      if (testDataConfig.users) {
        testData.users = testDataConfig.users.map((user, index) => ({
          id: user.id || `test-user-${index}`,
          username: user.username || `testuser${index}@test.com`,
          password: user.password || 'TestPass123!',
          email: user.email || `testuser${index}@test.com`,
          ...user,
        }));
      }

      // Validate and setup products
      if (testDataConfig.products) {
        testData.products = testDataConfig.products.map((product, index) => ({
          id: product.id || `test-product-${index}`,
          name: product.name || `Test Product ${index}`,
          price: product.price || 99.99,
          category: product.category || 'Test Category',
          ...product,
        }));
      }

      // Setup custom data
      if (testDataConfig.customData) {
        Object.assign(testData, testDataConfig.customData);
      }

      this.logger.info('Test data setup completed');
      return testData;
    } catch (error) {
      this.logger.error('Failed to setup test data', error);
      throw error;
    }
  }

  /**
   * Cleanup test environment after test execution
   */
  static async cleanupTestEnvironment(
    page: Page,
    options: {
      clearCookies?: boolean;
      clearLocalStorage?: boolean;
      clearSessionStorage?: boolean;
      takeScreenshot?: boolean;
      screenshotName?: string;
    } = {},
  ): Promise<void> {
    this.logger.info('Cleaning up test environment');

    try {
      // Take screenshot if requested
      if (options.takeScreenshot) {
        const screenshotName = options.screenshotName || `cleanup-${Date.now()}.png`;
        await page.screenshot({ 
          path: `screenshots/${screenshotName}`,
          fullPage: true, 
        });
      }

      // Clear browser data
      if (options.clearCookies) {
        await page.context().clearCookies();
      }

      if (options.clearLocalStorage || options.clearSessionStorage) {
        await page.evaluate(({ clearLocal, clearSession }) => {
          if (clearLocal) localStorage.clear();
          if (clearSession) sessionStorage.clear();
        }, {
          clearLocal: options.clearLocalStorage,
          clearSession: options.clearSessionStorage,
        });
      }

      this.logger.info('Test environment cleanup completed');
    } catch (error) {
      this.logger.error('Failed to cleanup test environment', error);
      // Don't throw error during cleanup to avoid masking original test failures
    }
  }

  /**
   * Wait for application to be ready with health checks
   */
  static async waitForApplicationReady(
    page: Page,
    healthChecks: {
      url?: string;
      elements?: string[];
      apiEndpoints?: string[];
      timeout?: number;
    } = {},
  ): Promise<void> {
    this.logger.info('Waiting for application to be ready');

    const timeout = healthChecks.timeout || 30000;
    const startTime = Date.now();

    try {
      // Wait for page load states
      await page.waitForLoadState('domcontentloaded', { timeout });
      await page.waitForLoadState('networkidle', { timeout: timeout - (Date.now() - startTime) });

      // Check for specific elements if provided
      if (healthChecks.elements) {
        for (const selector of healthChecks.elements) {
          await page.waitForSelector(selector, { 
            timeout: timeout - (Date.now() - startTime), 
          });
        }
      }

      // Check API endpoints if provided
      if (healthChecks.apiEndpoints) {
        for (const endpoint of healthChecks.apiEndpoints) {
          await page.waitForResponse(
            response => response.url().includes(endpoint) && response.status() === 200,
            { timeout: timeout - (Date.now() - startTime) },
          );
        }
      }

      this.logger.info('Application is ready');
    } catch (error) {
      this.logger.error('Application readiness check failed', error);
      throw error;
    }
  }

  /**
   * Setup browser context with enhanced configuration
   */
  static async setupBrowserContext(
    browser: Browser,
    options: {
      viewport?: { width: number; height: number };
      userAgent?: string;
      locale?: string;
      timezone?: string;
      geolocation?: { latitude: number; longitude: number };
      permissions?: string[];
      offline?: boolean;
      httpCredentials?: { username: string; password: string };
    } = {},
  ): Promise<BrowserContext> {
    this.logger.info('Setting up browser context');

    try {
      const contextOptions: any = {
        viewport: options.viewport || { width: 1280, height: 720 },
        userAgent: options.userAgent,
        locale: options.locale || 'en-US',
        timezoneId: options.timezone || 'America/New_York',
        geolocation: options.geolocation,
        permissions: options.permissions,
        offline: options.offline,
        httpCredentials: options.httpCredentials,
        // Enhanced video and trace settings
        recordVideo: process.env.CI ? undefined : {
          dir: 'videos/',
          size: options.viewport || { width: 1280, height: 720 },
        },
        // Security settings
        bypassCSP: true,
        ignoreHTTPSErrors: true,
      };

      const context = await browser.newContext(contextOptions);

      // Setup request/response logging in debug mode
      if (process.env.DEBUG) {
        context.on('request', request => {
          this.logger.debug(`Request: ${request.method()} ${request.url()}`);
        });

        context.on('response', response => {
          this.logger.debug(`Response: ${response.status()} ${response.url()}`);
        });
      }

      this.logger.info('Browser context setup completed');
      return context;
    } catch (error) {
      this.logger.error('Failed to setup browser context', error);
      throw error;
    }
  }

  /**
   * Handle test failures with enhanced debugging
   */
  static async handleTestFailure(
    page: Page,
    testInfo: {
      title: string;
      error?: Error;
      retry?: number;
    },
  ): Promise<void> {
    this.logger.error(`Test failed: ${testInfo.title}`, testInfo.error);

    try {
      const timestamp = Date.now();
      const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '-');

      // Take screenshot
      await page.screenshot({
        path: `screenshots/failure-${testName}-${timestamp}.png`,
        fullPage: true,
      });

      // Save page HTML for debugging
      const html = await page.content();
      fs.writeFileSync(
        `screenshots/failure-${testName}-${timestamp}.html`,
        html,
      );

      // Log page console messages
      try {
        const consoleLogs = await page.evaluate(() => {
          // Return any captured console messages if available
          return (window as any).consoleLogs || [];
        });

        if (consoleLogs && Array.isArray(consoleLogs) && consoleLogs.length > 0) {
          this.logger.debug('Page console logs:', consoleLogs);
        }
      } catch {
        this.logger.debug('Could not retrieve console logs');
      }

      // Log network activity
      const responses = await page.evaluate(() => {
        return performance.getEntriesByType('navigation').concat(
          performance.getEntriesByType('resource'),
        );
      });

      this.logger.debug('Network activity:', responses);

    } catch (debugError) {
      this.logger.error('Failed to capture debug information', debugError);
    }
  }

  /**
   * Generate unique test identifier
   */
  static generateTestId(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Measure test execution time
   */
  static createPerformanceTimer(): {
    start: () => void;
    end: () => number;
    getElapsed: () => number;
    } {
    let startTime: number;
    let endTime: number;

    return {
      start: () => {
        startTime = performance.now();
      },
      end: () => {
        endTime = performance.now();
        const elapsed = endTime - startTime;
        this.logger.info(`Test execution time: ${elapsed.toFixed(2)}ms`);
        return elapsed;
      },
      getElapsed: () => {
        return endTime ? endTime - startTime : performance.now() - startTime;
      },
    };
  }
}
