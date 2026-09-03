import { logger } from './logger';
import { config } from './config-manager';

/**
 * Database utilities for the IGS Playwright Framework
 * Provides database connection and query capabilities for test data setup/cleanup
 */
export class DatabaseUtils {
  private static instance: DatabaseUtils;
  private connectionConfig: any;

  private constructor() {
    this.connectionConfig = config.getDatabaseConfig();
  }

  /**
     * Get singleton instance
     */
  public static getInstance(): DatabaseUtils {
    if (!DatabaseUtils.instance) {
      DatabaseUtils.instance = new DatabaseUtils();
    }
    return DatabaseUtils.instance;
  }

  /**
     * Test database connection
     */
  async testConnection(): Promise<boolean> {
    try {
      // This would be implemented with actual database driver
      logger.info('Testing database connection...', this.connectionConfig);

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('Database connection successful');
      return true;
    } catch (error) {
      logger.error('Database connection failed', error);
      return false;
    }
  }

  /**
     * Execute SQL query
     */
  async executeQuery(query: string, params?: any[]): Promise<any[]> {
    try {
      logger.info(`Executing SQL query: ${query}`, { params });

      // This would be implemented with actual database driver
      // For now, return mock data
      const mockResults = this.getMockResults(query);

      logger.info(`Query executed successfully, returned ${mockResults.length} rows`);
      return mockResults;
    } catch (error) {
      logger.error('Failed to execute query', error);
      throw error;
    }
  }

  /**
     * Get mock results based on query type
     */
  private getMockResults(query: string): any[] {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('select') && lowerQuery.includes('users')) {
      return [
        { id: 1, username: 'test@example.com', email: 'test@example.com', created_at: new Date() },
        { id: 2, username: 'admin@example.com', email: 'admin@example.com', created_at: new Date() },
      ];
    }

    if (lowerQuery.includes('select') && lowerQuery.includes('products')) {
      return [
        { id: 1, name: 'Test Product 1', price: 99.99, category: 'Electronics' },
        { id: 2, name: 'Test Product 2', price: 149.99, category: 'Books' },
      ];
    }

    return [];
  }

  /**
     * Create test user in database
     */
  async createTestUser(userData: {
        username: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<any> {
    const query = `
      INSERT INTO users (username, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const params = [
      userData.username,
      userData.email,
      this.hashPassword(userData.password),
      userData.role || 'user',
    ];

    try {
      await this.executeQuery(query, params);
      logger.info(`Test user created: ${userData.username}`);
      return { id: Math.floor(Math.random() * 1000), ...userData };
    } catch (error) {
      logger.error('Failed to create test user', error);
      throw error;
    }
  }

  /**
     * Delete test user from database
     */
  async deleteTestUser(username: string): Promise<void> {
    const query = 'DELETE FROM users WHERE username = ?';

    try {
      await this.executeQuery(query, [username]);
      logger.info(`Test user deleted: ${username}`);
    } catch (error) {
      logger.error('Failed to delete test user', error);
      throw error;
    }
  }

  /**
     * Create test product in database
     */
  async createTestProduct(productData: {
        name: string;
        price: number;
        category: string;
        description?: string;
    }): Promise<any> {
    const query = `
      INSERT INTO products (name, price, category, description, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const params = [
      productData.name,
      productData.price,
      productData.category,
      productData.description || '',
    ];

    try {
      await this.executeQuery(query, params);
      logger.info(`Test product created: ${productData.name}`);
      return { id: Math.floor(Math.random() * 1000), ...productData };
    } catch (error) {
      logger.error('Failed to create test product', error);
      throw error;
    }
  }

  /**
     * Clean up test data
     */
  async cleanupTestData(testId?: string): Promise<void> {
    try {
      const queries = [
        'DELETE FROM orders WHERE test_id = ?',
        'DELETE FROM products WHERE test_id = ?',
        'DELETE FROM users WHERE test_id = ?',
      ];

      for (const query of queries) {
        await this.executeQuery(query, [testId || 'test']);
      }

      logger.info('Test data cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup test data', error);
      throw error;
    }
  }

  /**
     * Reset database to initial state
     */
  async resetDatabase(): Promise<void> {
    try {
      const resetQueries = [
        'TRUNCATE TABLE orders',
        'TRUNCATE TABLE products',
        'TRUNCATE TABLE users',
      ];

      for (const query of resetQueries) {
        await this.executeQuery(query);
      }

      // Insert default data
      await this.insertDefaultData();

      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Failed to reset database', error);
      throw error;
    }
  }

  /**
     * Insert default test data
     */
  private async insertDefaultData(): Promise<void> {
    // Create default users
    await this.createTestUser({
      username: 'admin@test.com',
      email: 'admin@test.com',
      password: 'AdminPass123!',
      role: 'admin',
    });

    await this.createTestUser({
      username: 'user@test.com',
      email: 'user@test.com',
      password: 'UserPass123!',
      role: 'user',
    });

    // Create default products
    await this.createTestProduct({
      name: 'Sample Product 1',
      price: 29.99,
      category: 'Electronics',
      description: 'A sample product for testing',
    });

    await this.createTestProduct({
      name: 'Sample Product 2',
      price: 19.99,
      category: 'Books',
      description: 'Another sample product for testing',
    });
  }

  /**
     * Get user by username
     */
  async getUserByUsername(username: string): Promise<any> {
    const query = 'SELECT * FROM users WHERE username = ?';
    const results = await this.executeQuery(query, [username]);
    return results[0] || null;
  }

  /**
     * Update user data
     */
  async updateUser(username: string, updateData: any): Promise<void> {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE users SET ${setClause} WHERE username = ?`;
    values.push(username);

    try {
      await this.executeQuery(query, values);
      logger.info(`User updated: ${username}`);
    } catch (error) {
      logger.error('Failed to update user', error);
      throw error;
    }
  }

  /**
     * Backup database
     */
  async backupDatabase(backupName?: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = backupName || `backup_${timestamp}.sql`;

      // This would implement actual backup logic
      logger.info(`Database backup created: ${filename}`);
      return filename;
    } catch (error) {
      logger.error('Failed to backup database', error);
      throw error;
    }
  }

  /**
     * Restore database from backup
     */
  async restoreDatabase(backupFile: string): Promise<void> {
    try {
      // This would implement actual restore logic
      logger.info(`Database restored from: ${backupFile}`);
    } catch (error) {
      logger.error('Failed to restore database', error);
      throw error;
    }
  }

  /**
     * Get table row count
     */
  async getRowCount(tableName: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${tableName}`;
    const results = await this.executeQuery(query);
    return results[0]?.count || 0;
  }

  /**
     * Check if table exists
     */
  async tableExists(tableName: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = ?
    `;

    const results = await this.executeQuery(query, [tableName]);
    return results[0]?.count > 0;
  }

  /**
     * Simple password hashing (for demo purposes)
     */
  private hashPassword(password: string): string {
    // In real implementation, use proper hashing like bcrypt
    return Buffer.from(password).toString('base64');
  }

  /**
     * Execute transaction
     */
  async executeTransaction(queries: Array<{ query: string; params?: any[] }>): Promise<void> {
    try {
      logger.info('Starting database transaction');

      // In real implementation, use actual transaction
      for (const { query, params } of queries) {
        await this.executeQuery(query, params);
      }

      logger.info('Transaction completed successfully');
    } catch (error) {
      logger.error('Transaction failed, rolling back', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dbUtils = DatabaseUtils.getInstance();
