import { Page, Response } from '@playwright/test';
import { logger } from '../logger'
export interface GraphQLResult<T = any> {
    request: any;
    response: T;
}

export class GraphQLHelper {
    private static readonly instances = new WeakMap<Page, GraphQLHelper>();
    private readonly responses = new Map<string, GraphQLResult<any>>();
    private constructor(private readonly page: Page) {
        this.startListening();
    }

    /**
     * Returns one GraphQLHelper instance per Playwright page.
     */
    public static getInstance(page: Page): GraphQLHelper {
        let instance = this.instances.get(page);
        if (!instance) {
            instance = new GraphQLHelper(page);
            this.instances.set(page, instance);
        }
        return instance;
    }

    /**
     * Listen to GraphQL responses and cache them.
     */
    private startListening(): void {
        this.page.on('response', async (response: Response) => {
            try {
                if (!response.url().includes('/graphql')) {
                    return;
                }
                // Ignore failed GraphQL calls
                if (response.status() < 200 || response.status() >= 300) {
                    logger.warn(
                        `Ignoring GraphQL response with status ${response.status()}`
                    );
                    return;
                }
                const request = response.request();
                const body = request.postDataJSON();
                if (!body) {
                    return;
                }
                const operationName =
                    body.operationName ??
                    body.query?.match(/query\s+([A-Za-z0-9_]+)/)?.[1] ??
                    body.query?.match(/mutation\s+([A-Za-z0-9_]+)/)?.[1];
                if (!operationName) {
                    return;
                }
                const responseBody = await this.readResponseBody(response);
                if (!responseBody) {
                    return;
                }
                this.responses.set(operationName, {
                    request: body,
                    response: responseBody
                });
                logger.info(`Cached GraphQL operation: ${operationName}`);
            } catch (error) {
                logger.warn(`Unable to cache GraphQL response: ${String(error)}`);
            }
        });
    }

    /**
     * Safely reads response body.
     * Handles Playwright protocol timing issues.
     */
    private async readResponseBody(
        response: Response,
        retries = 3
    ): Promise<any | null> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await response.json();
            } catch (error) {
                if (attempt === retries) {
                    return null;
                }
                await new Promise(resolve =>
                    setTimeout(resolve, 200)
                );
            }
        }
        return null;
    }

    public async waitForOperation<T>(
        operationName: string,
        timeout = 60000,
        retry = true,
        ignoreCached = false
    ): Promise<GraphQLResult<T>> {
        logger.info(`Waiting for GraphQL operation: ${operationName}`);
        if (operationName === 'Asset') {
            throw new Error('Asset GraphQL wait is disabled for post-playback flows');
        }
        const waitForCache = async (): Promise<GraphQLResult<T> | null> => {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const cached = this.responses.get(operationName);
                if (cached) {
                    logger.info(`Returning cached GraphQL operation: ${operationName}`);
                    return cached as GraphQLResult<T>;
                }
                await new Promise(resolve =>
                    setTimeout(resolve, 200)
                );
            }
            return null;
        };
        if (ignoreCached) {
            this.responses.delete(operationName);
        }
        let result = await waitForCache();
        if (result) {
            return result;
        }
        if (retry) {
            logger.warn(`GraphQL operation '${operationName}' not found. Refreshing page and retrying...`);
            this.responses.delete(operationName);
            await this.page.reload({ waitUntil: 'networkidle' });
            logger.info(`Page refreshed. Waiting again for ${operationName}`);
            result = await waitForCache();
            if (result) {
                return result;
            }
        }
        throw new Error(
            `GraphQL operation '${operationName}' was not captured after retry`
        );
    }

    public async waitForOperationMatching<T>(
        predicate: (result: GraphQLResult<T>) => boolean,
        timeout = 60000,
        retry = true
    ): Promise<GraphQLResult<T>> {
        logger.info('Waiting for a GraphQL operation that matches the requested predicate');
        const waitForCache = async (): Promise<GraphQLResult<T> | null> => {
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                for (const cached of this.responses.values()) {
                    if (predicate(cached as GraphQLResult<T>)) {
                        logger.info('Returning cached GraphQL operation that matched the predicate');
                        return cached as GraphQLResult<T>;
                    }
                }
                await new Promise(resolve =>
                    setTimeout(resolve, 200)
                );
            }
            return null;
        };
        let result = await waitForCache();
        if (result) {
            return result;
        }
        if (retry) {
            logger.warn('No matching GraphQL operation found. Refreshing page and retrying...');
            await this.page.reload({
                waitUntil: 'networkidle'
            });
            result = await waitForCache();
            if (result) {
                return result;
            }
        }
        throw new Error('No GraphQL operation matched the requested predicate after retry');
    }
}