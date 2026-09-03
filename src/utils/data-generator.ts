import { faker } from '@faker-js/faker';
// import { UserCredentials, Product, Order } from '../types/index';

/**
 * Test data generator using Faker.js
 */
export class DataGenerator {
  // /**
  //  * Generate random user credentials
  //  */
  // static generateUser(overrides?: Partial<UserCredentials>): UserCredentials {
  //   return {
  //     username: faker.internet.username(),
  //     password: faker.internet.password({ length: 12 }),
  //     email: faker.internet.email(),
  //     ...overrides,
  //   };
  // }

  // /**
  //  * Generate multiple users
  //  */
  // static generateUsers(count: number): UserCredentials[] {
  //   return Array.from({ length: count }, () => this.generateUser());
  // }

  // /**
  //  * Generate random product
  //  */
  // static generateProduct(overrides?: Partial<Product>): Product {
  //   return {
  //     id: faker.string.uuid(),
  //     name: faker.commerce.productName(),
  //     price: parseFloat(faker.commerce.price()),
  //     category: faker.commerce.department(),
  //     inStock: faker.datatype.boolean(),
  //     description: faker.commerce.productDescription(),
  //     ...overrides,
  //   };
  // }

  // /**
  //  * Generate multiple products
  //  */
  // static generateProducts(count: number): Product[] {
  //   return Array.from({ length: count }, () => this.generateProduct());
  // }

  // /**
  //  * Generate random order
  //  */
  // static generateOrder(overrides?: Partial<Order>): Order {
  //   const products = this.generateProducts(faker.number.int({ min: 1, max: 5 }));
  //   const total = products.reduce((sum, product) => sum + product.price, 0);

  //   return {
  //     id: faker.string.uuid(),
  //     userId: faker.string.uuid(),
  //     products,
  //     total,
  //     status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  //     createdAt: faker.date.recent(),
  //     ...overrides,
  //   };
  // }

  /**
   * Generate random string with specific pattern
   */
  static generateString(pattern: 'email' | 'phone' | 'url' | 'uuid' | 'alphanumeric', length?: number): string {
    switch (pattern) {
    case 'email':
      return faker.internet.email();
    case 'phone':
      return faker.phone.number();
    case 'url':
      return faker.internet.url();
    case 'uuid':
      return faker.string.uuid();
    case 'alphanumeric':
      return faker.string.alphanumeric(length || 10);
    default:
      return faker.string.alphanumeric(length || 10);
    }
  }

  /**
   * Generate random date within range
   */
  static generateDate(from?: Date, to?: Date): Date {
    return faker.date.between({ 
      from: from || new Date('2020-01-01'), 
      to: to || new Date(), 
    });
  }

  /**
   * Generate random number within range
   */
  static generateNumber(min: number = 0, max: number = 100): number {
    return faker.number.int({ min, max });
  }

  /**
   * Generate random boolean with probability
   */
  static generateBoolean(probability: number = 0.5): boolean {
    return faker.datatype.boolean({ probability });
  }

  /**
   * Generate random address
   */
  static generateAddress() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    };
  }

  /**
   * Generate random credit card
   */
  static generateCreditCard() {
    return {
      number: faker.finance.creditCardNumber(),
      cvv: faker.finance.creditCardCVV(),
      expiryDate: faker.date.future().toISOString().slice(0, 7), // YYYY-MM format
      holderName: faker.person.fullName(),
    };
  }

  // /**
  //  * Generate random file content
  //  */
  // static generateFileContent(type: 'text' | 'csv' | 'json', size?: number): string {
  //   switch (type) {
  //   case 'text':
  //     return faker.lorem.paragraphs(size || 3);
  //   case 'csv': {
  //     const headers = ['Name', 'Email', 'Age', 'City'];
  //     const rows = Array.from({ length: size || 10 }, () => [
  //       faker.person.fullName(),
  //       faker.internet.email(),
  //       faker.number.int({ min: 18, max: 80 }),
  //       faker.location.city(),
  //     ]);
  //     return [headers, ...rows].map(row => row.join(',')).join('\n');
  //   }
  //   case 'json': {
  //     const data = Array.from({ length: size || 5 }, () => this.generateUser());
  //     return JSON.stringify(data, null, 2);
  //   }
  //   default:
  //     return faker.lorem.text();
  //   }
  // }

  /**
   * Generate test scenario data based on template
   */
  static generateScenarioData<T>(template: () => T, count: number = 1): T[] {
    return Array.from({ length: count }, template);
  }

  /**
   * Seed faker for consistent test data
   */
  static seed(seedValue: number): void {
    faker.seed(seedValue);
  }

  /**
   * Reset faker seed
   */
  static resetSeed(): void {
    faker.seed();
  }
}
