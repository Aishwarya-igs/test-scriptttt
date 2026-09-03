// import { APIRequestContext, APIResponse } from '@playwright/test';
// // import { ApiResponse } from '../types/index';
// import * as fs from 'fs';

// /**
//  * API testing utilities for REST API interactions
//  */
// export class ApiUtils {
//   // eslint-disable-next-line no-unused-vars
//   constructor(private readonly request: APIRequestContext) {
//     // Constructor initializes the request context for API operations
//   }

//   /**
//    * Perform GET request with response validation
//    */
//   async get<T = unknown>(url: string, options?: {
//     headers?: Record<string, string>;
//     params?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const response = await this.request.get(url, {
//       headers: options?.headers,
//       params: options?.params,
//       timeout: options?.timeout || 15000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Perform POST request with payload
//    */
//   async post<T = unknown>(url: string, data?: unknown, options?: {
//     headers?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const response = await this.request.post(url, {
//       data,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options?.headers,
//       },
//       timeout: options?.timeout || 15000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Perform PUT request
//    */
//   async put<T = unknown>(url: string, data?: unknown, options?: {
//     headers?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const response = await this.request.put(url, {
//       data,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options?.headers,
//       },
//       timeout: options?.timeout || 15000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Perform PATCH request
//    */
//   async patch<T = unknown>(url: string, data?: unknown, options?: {
//     headers?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const response = await this.request.patch(url, {
//       data,
//       headers: {
//         'Content-Type': 'application/json',
//         ...options?.headers,
//       },
//       timeout: options?.timeout || 15000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Perform DELETE request
//    */
//   async delete<T = unknown>(url: string, options?: {
//     headers?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const response = await this.request.delete(url, {
//       headers: options?.headers,
//       timeout: options?.timeout || 15000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Upload file via multipart form data
//    */
//   async uploadFile<T = unknown>(url: string, filePath: string, fieldName: string = 'file', options?: {
//     headers?: Record<string, string>;
//     additionalFields?: Record<string, string>;
//     timeout?: number;
//   }): Promise<ApiResponse<T>> {
//     const formData = new FormData();
    
//     // Add file
//     const fileBuffer = fs.readFileSync(filePath);
//     const fileName = filePath.split('/').pop() || 'file';
//     formData.append(fieldName, new Blob([fileBuffer]), fileName);

//     // Add additional fields
//     if (options?.additionalFields) {
//       Object.entries(options.additionalFields).forEach(([key, value]) => {
//         formData.append(key, value);
//       });
//     }

//     const response = await this.request.post(url, {
//       multipart: formData,
//       headers: options?.headers,
//       timeout: options?.timeout || 30000,
//     });

//     return this.formatResponse<T>(response);
//   }

//   /**
//    * Format API response to standardized format
//    */
//   private async formatResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
//     let data: T;
    
//     try {
//       const text = await response.text();
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = await response.text() as unknown as T;
//     }

//     return {
//       status: response.status(),
//       statusText: response.statusText(),
//       data,
//       headers: response.headers(),
//     };
//   }

//   /**
//    * Assert response status code
//    */
//   assertStatus(response: ApiResponse, expectedStatus: number): void {
//     if (response.status !== expectedStatus) {
//       throw new Error(
//         `Expected status ${expectedStatus}, but got ${response.status}: ${response.statusText}`,
//       );
//     }
//   }

//   /**
//    * Assert response contains data
//    */
//   assertContainsData(response: ApiResponse, path: string, expectedValue: unknown): void {
//     const actualValue = this.getNestedValue(response.data, path);
//     if (actualValue !== expectedValue) {
//       throw new Error(
//         `Expected ${path} to be ${expectedValue}, but got ${actualValue}`,
//       );
//     }
//   }

//   /**
//    * Assert response schema using JSON schema validation
//    */
//   async assertSchema(response: ApiResponse, schema: object): Promise<void> {
//     // Note: Requires ajv package for schema validation
//     // This is a placeholder for schema validation
//     if (!response.data) {
//       throw new Error('Schema validation failed: no data to validate');
//     }
    
//     // Basic validation placeholder - would use schema in real implementation
//     if (typeof response.data !== 'object') {
//       throw new Error('Schema validation failed: data is not an object');
//     }
    
//     // Schema validation placeholder - schema parameter is reserved for future implementation
//     if (schema && typeof schema !== 'object') {
//       throw new Error('Invalid schema provided');
//     }
//   }

//   /**
//    * Get nested value from object using dot notation
//    */
//   private getNestedValue(obj: unknown, path: string): unknown {
//     return path.split('.').reduce((current: unknown, key: string) => {
//       return current && typeof current === 'object' && key in current 
//         ? (current as Record<string, unknown>)[key] 
//         : undefined;
//     }, obj);
//   }

//   /**
//    * Wait for API condition to be met with polling
//    */
//   async waitForCondition<T>(
//     requestFn: () => Promise<ApiResponse<T>>,
//     // eslint-disable-next-line no-unused-vars
//     condition: (_response: ApiResponse<T>) => boolean,
//     options?: {
//       timeout?: number;
//       interval?: number;
//       description?: string;
//     },
//   ): Promise<ApiResponse<T>> {
//     const timeout = options?.timeout || 30000;
//     const interval = options?.interval || 1000;
//     const startTime = Date.now();

//     while (Date.now() - startTime < timeout) {
//       const response = await requestFn();
      
//       if (condition(response)) {
//         return response;
//       }

//       await new Promise(resolve => setTimeout(resolve, interval));
//     }

//     throw new Error(
//       `Timeout waiting for API condition: ${options?.description || 'condition not met'}`,
//     );
//   }

//   /**
//    * Retry API request with exponential backoff
//    */
//   async retryRequest<T>(
//     requestFn: () => Promise<ApiResponse<T>>,
//     options?: {
//       maxRetries?: number;
//       baseDelay?: number;
//       maxDelay?: number;
//       // eslint-disable-next-line no-unused-vars
//       condition?: (_response: ApiResponse<T>) => boolean;
//     },
//   ): Promise<ApiResponse<T>> {
//     const maxRetries = options?.maxRetries || 3;
//     const baseDelay = options?.baseDelay || 1000;
//     const maxDelay = options?.maxDelay || 10000;
//     const condition = options?.condition || ((response) => response.status >= 200 && response.status < 300);

//     let lastResponse: ApiResponse<T> | undefined;

//     for (let attempt = 0; attempt <= maxRetries; attempt++) {
//       try {
//         lastResponse = await requestFn();
        
//         if (condition(lastResponse)) {
//           return lastResponse;
//         }
//       } catch (error) {
//         if (attempt === maxRetries) {
//           throw error;
//         }
//       }

//       if (attempt < maxRetries) {
//         const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
//         await new Promise(resolve => setTimeout(resolve, delay));
//       }
//     }

//     if (!lastResponse) {
//       throw new Error('No response received after all retry attempts');
//     }

//     return lastResponse;
//   }
// }
