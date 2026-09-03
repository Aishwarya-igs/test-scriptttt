import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * File utilities for the IGS Playwright Framework
 * Handles file operations, CSV parsing, JSON manipulation, and test data management
 */
export class FileUtils {
  /**
     * Read file content as string
     */
  static readFile(filePath: string): string {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Write content to file
     */
  static writeFile(filePath: string, content: string): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf8');
      logger.debug(`File written: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Append content to file
     */
  static appendFile(filePath: string, content: string): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(filePath, content, 'utf8');
      logger.debug(`Content appended to file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to append to file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Check if file exists
     */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
     * Delete file
     */
  static deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug(`File deleted: ${filePath}`);
      }
    } catch (error) {
      logger.error(`Failed to delete file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Create directory if it doesn't exist
     */
  static createDirectory(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug(`Directory created: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Failed to create directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
     * Delete directory and its contents
     */
  static deleteDirectory(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        logger.debug(`Directory deleted: ${dirPath}`);
      }
    } catch (error) {
      logger.error(`Failed to delete directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
     * Get list of files in directory
     */
  static getFiles(dirPath: string, extension?: string): string[] {
    try {
      if (!fs.existsSync(dirPath)) {
        return [];
      }

      let files = fs.readdirSync(dirPath);

      if (extension) {
        files = files.filter(file => file.endsWith(extension));
      }

      return files.map(file => path.join(dirPath, file));
    } catch (error) {
      logger.error(`Failed to get files from directory: ${dirPath}`, error);
      throw error;
    }
  }

  /**
     * Read JSON file
     */
  static readJSON<T = any>(filePath: string): T {
    try {
      const content = this.readFile(filePath);
      return JSON.parse(content);
    } catch (error) {
      logger.error(`Failed to read JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Write JSON to file
     */
  static writeJSON(filePath: string, data: any, indent: number = 2): void {
    try {
      const content = JSON.stringify(data, null, indent);
      this.writeFile(filePath, content);
    } catch (error) {
      logger.error(`Failed to write JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Read CSV file and return as array of objects
     */
  static readCSV(filePath: string): any[] {
    try {
      const content = this.readFile(filePath);
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        return [];
      }

      const headers = lines[0]?.split(',').map(header => header.trim()) || [];
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        if (!currentLine) continue;

        const values = currentLine.split(',').map(value => value.trim());
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        data.push(row);
      }

      return data;
    } catch (error) {
      logger.error(`Failed to read CSV file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Write array of objects to CSV file
     */
  static writeCSV(filePath: string, data: any[]): void {
    try {
      if (data.length === 0) {
        this.writeFile(filePath, '');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => `"${row[header] || ''}"`).join(','),
        ),
      ].join('\n');

      this.writeFile(filePath, csvContent);
    } catch (error) {
      logger.error(`Failed to write CSV file: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Get file size in bytes
     */
  static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      logger.error(`Failed to get file size: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Get file modification time
     */
  static getModificationTime(filePath: string): Date {
    try {
      const stats = fs.statSync(filePath);
      return stats.mtime;
    } catch (error) {
      logger.error(`Failed to get modification time: ${filePath}`, error);
      throw error;
    }
  }

  /**
     * Copy file
     */
  static copyFile(sourcePath: string, destinationPath: string): void {
    try {
      const dir = path.dirname(destinationPath);
      this.createDirectory(dir);
      fs.copyFileSync(sourcePath, destinationPath);
      logger.debug(`File copied from ${sourcePath} to ${destinationPath}`);
    } catch (error) {
      logger.error(`Failed to copy file from ${sourcePath} to ${destinationPath}`, error);
      throw error;
    }
  }

  /**
     * Move file
     */
  static moveFile(sourcePath: string, destinationPath: string): void {
    try {
      this.copyFile(sourcePath, destinationPath);
      this.deleteFile(sourcePath);
      logger.debug(`File moved from ${sourcePath} to ${destinationPath}`);
    } catch (error) {
      logger.error(`Failed to move file from ${sourcePath} to ${destinationPath}`, error);
      throw error;
    }
  }

  /**
     * Create test data directory structure
     */
  static createTestDataStructure(): void {
    const directories = [
      'test-data',
      'test-data/users',
      'test-data/products',
      'test-data/orders',
      'test-data/api-responses',
      'test-results',
      'screenshots',
      'videos',
      'downloads',
      'logs',
    ];

    directories.forEach(dir => this.createDirectory(dir));
    logger.info('Test data directory structure created');
  }

  /**
     * Clean up test artifacts
     */
  static cleanupTestArtifacts(): void {
    const directories = [
      'test-results',
      'playwright-report',
      'allure-results',
      'allure-report',
      'screenshots',
      'videos',
      'downloads',
    ];

    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.deleteDirectory(dir);
      }
    });

    logger.info('Test artifacts cleaned up');
  }

  /**
     * Get test data file path
     */
  static getTestDataPath(category: string, filename: string): string {
    return path.join('test-data', category, filename);
  }

  /**
     * Load test data from file
     */
  static loadTestData(category: string, filename: string): any {
    const filePath = this.getTestDataPath(category, filename);

    if (filename.endsWith('.json')) {
      return this.readJSON(filePath);
    } else if (filename.endsWith('.csv')) {
      return this.readCSV(filePath);
    } else {
      return this.readFile(filePath);
    }
  }

  /**
     * Save test data to file
     */
  static saveTestData(category: string, filename: string, data: any): void {
    const filePath = this.getTestDataPath(category, filename);

    if (filename.endsWith('.json')) {
      this.writeJSON(filePath, data);
    } else if (filename.endsWith('.csv')) {
      this.writeCSV(filePath, data);
    } else {
      this.writeFile(filePath, typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  /**
     * Generate unique filename with timestamp
     */
  static generateUniqueFilename(prefix: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
  }

  /**
     * Get file extension
     */
  static getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
  }

  /**
     * Get filename without extension
     */
  static getFilenameWithoutExtension(filePath: string): string {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
     * Join paths safely
     */
  static joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  /**
     * Get relative path
     */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
     * Check if path is absolute
     */
  static isAbsolutePath(filePath: string): boolean {
    return path.isAbsolute(filePath);
  }
}
