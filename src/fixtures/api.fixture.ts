import { test as base } from '@playwright/test';
import { config } from '@config/env';
import { ApiClient } from '@api/index';

export interface ApiFixtures {
  /**
   * Unauthenticated API client bound to the current environment's API base URL.
   * Uses its own `APIRequestContext` (separate from the browser) so cookies/headers
   * never leak between the API layer and the UI under test.
   */
  api: ApiClient;
}

export const apiTest = base.extend<ApiFixtures>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
      ignoreHTTPSErrors: config.ignoreHttpsErrors,
    });
    await use(new ApiClient(request, config.apiBaseUrl));
    await request.dispose();
  },
});
