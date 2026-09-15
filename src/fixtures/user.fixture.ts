import fs from 'node:fs';
import { config } from '@config/env';
import { apiTest as base } from './api.fixture';
import { ApiClient, type TestUser } from '@api/index';
import { createTestUser } from '@data/test-users';
import { DEFAULT_USER_META } from '@utils/paths';
import { createLogger } from '@utils/logger';

const log = createLogger('fixture:user');

export interface UserFixtures {
  /** A brand-new user created via API for this test only. Use when the test mutates account state. */
  testUser: TestUser;
  /** API client already authenticated as `testUser`. */
  userApi: ApiClient;
}

export interface UserWorkerFixtures {
  /**
   * Shared read-only user for the whole worker. Created once by the `setup` project
   * (see tests/setup/auth.setup.ts) and persisted to `.auth/`; falls back to creating
   * a fresh user when the file is missing (e.g. running a single project without deps).
   */
  defaultUser: TestUser;
}

export const userTest = base.extend<UserFixtures, UserWorkerFixtures>({
  defaultUser: [
    async ({ playwright }, use) => {
      let user: TestUser | undefined;

      if (fs.existsSync(DEFAULT_USER_META)) {
        user = JSON.parse(fs.readFileSync(DEFAULT_USER_META, 'utf-8')) as TestUser;
        log.debug(`Using default user from ${DEFAULT_USER_META}`, { email: user.email });
      } else {
        log.warn('Default user metadata not found – creating a worker-scoped user via API');
        const request = await playwright.request.newContext({ baseURL: config.apiBaseUrl });
        user = await createTestUser(new ApiClient(request));
        await request.dispose();
      }

      await use(user);
    },
    { scope: 'worker' },
  ],

  testUser: async ({ api }, use) => {
    const user = await createTestUser(api);
    log.debug('Created per-test user', { email: user.email });
    await use(user);
    // Cleanup requires admin rights on this backend; wire it here when ADMIN_* are configured.
  },

  userApi: async ({ playwright, testUser }, use) => {
    const request = await playwright.request.newContext({ baseURL: config.apiBaseUrl });
    const client = new ApiClient(request);
    await client.authenticate({ email: testUser.email, password: testUser.password });
    await use(client);
    await request.dispose();
  },
});
