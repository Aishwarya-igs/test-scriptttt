import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { logger } from './logger';

/**
 * Configuration manager for the IGS Playwright Framework
 * Handles environment variables, config files, and runtime settings
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, any> = {};
  private envLoaded: boolean = false;

  private constructor() {
    this.loadEnvironmentVariables();
    this.loadConfigFiles();
  }

  /**
     * Get singleton instance
     */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
     * Load environment variables from .env files
     */
  private loadEnvironmentVariables(): void {
    try {
      dotenv.config({ path: '.env' });
      this.envLoaded = true;
      logger.configLoaded('Environment Variables', '.env');
    } catch {
      logger.warn('No .env file found, using system environment variables');
    }
  }

  /**
     * Load configuration from JSON files
     */
  private loadConfigFiles(): void {
    const configDir = 'config';
    const environment = this.getEnvironment();

    // Load base config
    this.loadConfigFile(path.join(configDir, 'base.json'));

    // Load environment-specific config
    this.loadConfigFile(path.join(configDir, `${environment}.json`));

    // Load local overrides if exists
    this.loadConfigFile(path.join(configDir, 'local.json'));
  }

  /**
     * Load a specific config file
     */
  private loadConfigFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.config = { ...this.config, ...configData };
        logger.configLoaded('JSON Config', filePath);
      }
    } catch (error) {
      logger.warn(`Failed to load config file: ${filePath}`, error);
    }
  }

  /**
     * Get configuration value with optional fallback
     */
  public get(key: string, defaultValue?: any): any {
    // Check environment variables first
    const envValue = process.env[key];
    if (envValue !== undefined) {
      return this.parseValue(envValue);
    }

    // Check config object
    const configValue = this.getNestedValue(this.config, key);
    if (configValue !== undefined) {
      return configValue;
    }

    // Return default value
    return defaultValue;
  }

  /**
     * Set configuration value
     */
  public set(key: string, value: any): void {
    this.setNestedValue(this.config, key, value);
  }

  /**
     * Get nested value from object using dot notation
     */
  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
     * Set nested value in object using dot notation
     */
  private setNestedValue(obj: any, key: string, value: any): void {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, prop) => {
      if (!current[prop]) current[prop] = {};
      return current[prop];
    }, obj);
    target[lastKey] = value;
  }

  /**
     * Parse string value to appropriate type
     */
  private parseValue(value: string): any {
    // Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Number
    if (!isNaN(Number(value))) return Number(value);

    // JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    return value;
  }

  /**
     * Get current environment
     */
  public getEnvironment(): string {
    return this.get('TEST_ENV', this.get('ENVIRONMENT', 'test'));
  }

  /**
     * Get base URL
     */
  public getBaseURL(): string {
    const environment = this.getEnvironment().toString().trim().toUpperCase();
    const envSpecificKeys = [
      'BASE_URL',
      `${environment}_BASE_URL`,
      `${environment}_OTT_BASE_URL`,
      `${environment}_API_BASE_URL`,
    ];

    for (const key of envSpecificKeys) {
      const value = this.get(key);
      if (value) {
        logger.environmentSetup(environment, value);
        return value;
      }
    }

    throw new Error(`Missing base URL configuration. Please set BASE_URL or ${environment}_BASE_URL in .env`);
  }

  /**
     * Get API base URL
     */
  public getAPIBaseURL(): string {
    return this.get('API_BASE_URL', this.getBaseURL() + '/api');
  }

  /**
     * Get browser configuration
     */
  public getBrowserConfig(): {
    headless: boolean;
    slowMo: number;
    timeout: number;
    viewport: { width: number; height: number };
  } {
    return {
      headless: this.get('HEADLESS', true),
      slowMo: this.get('SLOW_MO', 0),
      timeout: this.get('BROWSER_TIMEOUT', 30000),
      viewport: {
        width: this.get('VIEWPORT_WIDTH', 1280),
        height: this.get('VIEWPORT_HEIGHT', 720),
      },
    };
  }

  /**
     * Get test configuration
     */
  public getTestConfig(): {
    timeout: number;
    retries: number;
    workers: number;
    maxRetries: number;
  } {
    return {
      timeout: this.get('TEST_TIMEOUT', 30000),
      retries: this.get('MAX_RETRIES', 2),
      workers: this.get('WORKERS', 4),
      maxRetries: this.get('MAX_RETRIES', 2),
    };
  }

  /**
     * Get authentication credentials
     */
  public getCredentials(userType: 'default' | 'admin' = 'default'): {
    username: string;
    password: string;
  } {
    const prefix = userType === 'admin' ? 'ADMIN_' : 'DEFAULT_';
    return {
      username: this.get(`${prefix}USERNAME`, `${userType}@test.com`),
      password: this.get(`${prefix}PASSWORD`, `${userType}Pass123!`),
    };
  }

  /**
     * Get database configuration
     */
  public getDatabaseConfig(): {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  } {
    return {
      host: this.get('DB_HOST', 'localhost'),
      port: this.get('DB_PORT', 5432),
      name: this.get('DB_NAME', 'test_db'),
      username: this.get('DB_USERNAME', 'test_user'),
      password: this.get('DB_PASSWORD', 'test_password'),
    };
  }

  /**
     * Get reporting configuration
     */
  public getReportingConfig(): {
    allureResultsDir: string;
    allureReportDir: string;
    screenshotsDir: string;
    videosDir: string;
  } {
    return {
      allureResultsDir: this.get('ALLURE_RESULTS_DIR', 'allure-results'),
      allureReportDir: this.get('ALLURE_REPORT_DIR', 'allure-report'),
      screenshotsDir: this.get('SCREENSHOTS_DIR', 'screenshots'),
      videosDir: this.get('VIDEOS_DIR', 'videos'),
    };
  }

  /**
     * Get third-party service configurations
     */
  public getServiceConfig(service: string): any {
    const serviceConfigs = {
      slack: {
        webhookUrl: this.get('SLACK_WEBHOOK_URL'),
        channel: this.get('SLACK_CHANNEL', '#automation'),
      },
      teams: {
        webhookUrl: this.get('TEAMS_WEBHOOK_URL'),
      },
      email: {
        apiKey: this.get('EMAIL_SERVICE_API_KEY'),
        from: this.get('EMAIL_FROM', 'automation@test.com'),
        to: this.get('EMAIL_TO', 'team@test.com'),
      },
      browserstack: {
        username: this.get('BROWSERSTACK_USERNAME'),
        accessKey: this.get('BROWSERSTACK_ACCESS_KEY'),
        url: this.get('BROWSERSTACK_URL', 'https://hub-cloud.browserstack.com/wd/hub'),
      },
    };

    return serviceConfigs[service as keyof typeof serviceConfigs];
  }

  /**
     * Get all configuration as object
     */
  public getAll(): Record<string, any> {
    return {
      environment: this.getEnvironment(),
      baseURL: this.getBaseURL(),
      apiBaseURL: this.getAPIBaseURL(),
      browser: this.getBrowserConfig(),
      test: this.getTestConfig(),
      credentials: {
        default: this.getCredentials('default'),
        admin: this.getCredentials('admin'),
      },
      database: this.getDatabaseConfig(),
      reporting: this.getReportingConfig(),
      ...this.config,
    };
  }

  /**
     * Validate required configuration
     */
  public validateConfig(): { valid: boolean; missing: string[] } {
    const required = [
      'BASE_URL',
    ];

    const missing = required.filter(key => !this.get(key));

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
     * Log current configuration (excluding sensitive data)
     */
  public logConfig(): void {
    const config = this.getAll();

    // Remove sensitive data
    const sanitized = JSON.parse(JSON.stringify(config));
    if (sanitized.credentials) {
      Object.keys(sanitized.credentials).forEach(user => {
        if (sanitized.credentials[user].password) {
          sanitized.credentials[user].password = '***';
        }
      });
    }

    if (sanitized.database?.password) {
      sanitized.database.password = '***';
    }

    logger.info('Current Configuration', sanitized);
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();
