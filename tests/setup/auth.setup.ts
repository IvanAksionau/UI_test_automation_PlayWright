import fs from 'node:fs';
import path from 'node:path';
import { test as setup, expect } from '@fixtures';
import { config } from '@config/env';
import { createTestUser } from '@data/test-users';
import { DEFAULT_USER_META } from '@utils/paths';
import { createLogger } from '@utils/logger';

const log = createLogger('setup');

/**
 * Runs once before every UI project (declared as a `dependencies` entry in playwright.config.ts).
 *
 * 1. Verifies the API for the selected environment is reachable.
 * 2. Provisions the shared `defaultUser` through the API (or validates ADMIN_* credentials
 *    when they are supplied) and persists it under `.auth/` for the worker fixtures.
 */
setup('provision default test user via API', async ({ api }) => {
  await setup.step('API health check', async () => {
    const products = await api.products.list();
    expect(products.data.length, `No products returned from ${config.apiBaseUrl}`).toBeGreaterThan(0);
  });

  const user = await setup.step('Create or validate default user', async () => {
    if (config.adminEmail && config.adminPassword) {
      await api.authenticate({ email: config.adminEmail, password: config.adminPassword });
      const me = await api.users.me();
      return {
        id: me.id,
        email: config.adminEmail,
        password: config.adminPassword,
        firstName: me.first_name,
        lastName: me.last_name,
      };
    }
    return createTestUser(api);
  });

  await setup.step('Verify credentials', async () => {
    const { access_token } = await api.users.login({ email: user.email, password: user.password });
    expect(access_token).toBeTruthy();
  });

  fs.mkdirSync(path.dirname(DEFAULT_USER_META), { recursive: true });
  fs.writeFileSync(DEFAULT_USER_META, JSON.stringify(user, null, 2));
  log.info(`Default user for "${config.name}" saved`, { email: user.email, file: DEFAULT_USER_META });
});
