import * as fs from 'fs';
import * as path from 'path';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Simple logger utility for the IGS Playwright Framework
 * Provides structured logging with different levels and formats
 */
class Logger {
  private static instance: Logger;
  private logLevel: string;
  private logsDir: string;

  private constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logsDir = 'logs';

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
     * Get singleton instance of Logger
     */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
  }

  private writeToFile(level: string, formattedMessage: string): void {
    const logFile = path.join(this.logsDir, 'combined.log');
    const errorFile = path.join(this.logsDir, 'error.log');

    fs.appendFileSync(logFile, formattedMessage + '\n');

    if (level === 'error') {
      fs.appendFileSync(errorFile, formattedMessage + '\n');
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private log(level: string, message: string, meta?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output with colors
    switch (level) {
    case 'error':
      console.error(`\x1b[31m${formattedMessage}\x1b[0m`);
      break;
    case 'warn':
      console.warn(`\x1b[33m${formattedMessage}\x1b[0m`);
      break;
    case 'info':
      console.info(`\x1b[36m${formattedMessage}\x1b[0m`);
      break;
    case 'debug':
      console.debug(`\x1b[37m${formattedMessage}\x1b[0m`);
      break;
    default:
    }

    // Write to file
    this.writeToFile(level, formattedMessage);
  }

  /**
     * Log info level message
     */
  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  /**
     * Log error level message
     */
  public error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      this.log('error', message, { error: error.message, stack: error.stack });
    } else {
      this.log('error', message, error);
    }
  }

  /**
     * Log warning level message
     */
  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  /**
     * Log debug level message
     */
  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  /**
     * Log test step
     */
  public step(stepName: string, meta?: any): void {
    this.info(`STEP: ${stepName}`, meta);
  }

  /**
     * Log test start
     */
  public testStart(testName: string): void {
    this.info(`TEST START: ${testName}`);
  }

  /**
     * Log test end
     */
  public testEnd(testName: string, status: 'PASSED' | 'FAILED' | 'SKIPPED', duration?: number): void {
    const meta = duration ? { duration: `${duration}ms` } : {};
    this.info(`TEST END: ${testName} - ${status}`, meta);
  }

  /**
     * Log API request
     */
  public apiRequest(method: string, url: string, payload?: any): void {
    this.info(`API REQUEST: ${method} ${url}`, { payload });
  }

  /**
     * Log API response
     */
  public apiResponse(method: string, url: string, status: number, responseTime?: number): void {
    const meta = responseTime ? { responseTime: `${responseTime}ms` } : {};
    this.info(`API RESPONSE: ${method} ${url} - ${status}`, meta);
  }

  /**
     * Log page navigation
     */
  public pageNavigation(url: string): void {
    this.info(`PAGE NAVIGATION: ${url}`);
  }

  /**
     * Log element interaction
     */
  public elementInteraction(action: string, selector: string): void {
    this.debug(`ELEMENT INTERACTION: ${action} on ${selector}`);
  }

  /**
     * Log browser action
     */
  public browserAction(action: string, details?: any): void {
    this.debug(`BROWSER ACTION: ${action}`, details);
  }

  /**
     * Log performance metrics
     */
  public performance(metrics: any): void {
    this.info('PERFORMANCE METRICS', metrics);
  }

  /**
     * Log screenshot capture
     */
  public screenshot(path: string): void {
    this.info(`SCREENSHOT: ${path}`);
  }

  public assertion(description: string, result: boolean): void {
    const status = result ? 'PASSED' : 'FAILED';

    if (result) {
      this.info(`ASSERTION ${status}: ${description}`);
    } else {
      this.error(`ASSERTION ${status}: ${description}`);
      throw new Error(`ASSERTION FAILED: ${description}`);
    }
  }

  /**
     * Log data generation
     */
  public dataGeneration(type: string, count: number): void {
    this.debug(`DATA GENERATION: Generated ${count} ${type} records`);
  }

  /**
     * Log configuration loading
     */
  public configLoaded(configType: string, source: string): void {
    this.info(`CONFIG LOADED: ${configType} from ${source}`);
  }

  /**
     * Log environment setup
     */
  public environmentSetup(environment: string, baseUrl: string): void {
    this.info(`ENVIRONMENT SETUP: ${environment} - ${baseUrl}`);
  }

  /***
   * Log colour
   */
  private colorLog(message: string, colorCode: string): void {
    const formattedMessage = this.formatMessage('info', message);
    logger.info(`${colorCode}${formattedMessage}\x1b[0m`);
    this.writeToFile('info', formattedMessage);
  }



  public start(message: string): void {

  const formattedMessage = this.formatMessage('info', message);

  logger.info(
    `${BOLD}${GREEN}${formattedMessage}${RESET}`
  );

  this.writeToFile('info', formattedMessage);
}


public success(message: string): void {

  const formattedMessage = this.formatMessage('info', message);

  logger.info(
    `${BOLD}${GREEN}${formattedMessage}${RESET}`
  );

  this.writeToFile('info', formattedMessage);
}


public failure(message: string): void {

  const formattedMessage = this.formatMessage('error', message);

  console.error(
    `${BOLD}${RED}${formattedMessage}${RESET}`
  );

  this.writeToFile('error', formattedMessage);
}
}

// Export singleton instance and class
export const logger = Logger.getInstance();
export { Logger };
