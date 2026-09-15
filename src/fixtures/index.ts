/**
 * Single entry point for tests:
 *
 *   import { test, expect } from '@fixtures';
 *
 * `test` carries every custom fixture (api, users, session, page objects) on top of
 * Playwright's built-ins. Fixture chain: api -> user -> session -> pages.
 */
import { pagesTest } from './pages.fixture';

export const test = pagesTest;
export { expect } from '@playwright/test';

export type { ApiFixtures } from './api.fixture';
export type { UserFixtures, UserWorkerFixtures } from './user.fixture';
export type { SessionFixtures, SessionApi } from './session.fixture';
export type { PageFixtures } from './pages.fixture';
