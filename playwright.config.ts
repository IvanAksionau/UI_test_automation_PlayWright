import { defineConfig, type Project } from '@playwright/test';
import { config } from './config/env';
import { allProfiles, type DeviceProfile } from './config/devices';

/**
 * Turns a device profile into a Playwright project.
 * All UI projects depend on the `setup` project which authenticates once via API
 * and stores the browser storage state for reuse (no UI login per test).
 */
const toUiProject = (profile: DeviceProfile): Project => ({
  name: profile.name,
  testDir: './tests/ui',
  dependencies: ['setup'],
  metadata: { engine: profile.engine, formFactor: profile.formFactor },
  use: {
    ...profile.use,
    baseURL: config.baseUrl,
  },
});

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.(spec|setup)\.ts/,

  /* ---------- Parallelism ---------- */
  fullyParallel: true,
  workers: config.workers ?? (config.ci ? '50%' : undefined),
  forbidOnly: config.ci,
  retries: config.retries,

  /* ---------- Timeouts (per environment) ---------- */
  timeout: config.timeouts.test,
  expect: { timeout: config.timeouts.expect },
  globalTimeout: config.ci ? 60 * 60 * 1000 : undefined,

  /* ---------- Output & reporting ---------- */
  outputDir: './test-results',
  reporter: config.ci
    ? [
        ['list'],
        ['html', { outputFolder: 'reports/html', open: 'never' }],
        ['junit', { outputFile: 'reports/junit/results.xml' }],
        ['json', { outputFile: 'reports/json/results.json' }],
        ['blob', { outputDir: 'reports/blob' }],
      ]
    : [['list'], ['html', { outputFolder: 'reports/html', open: 'on-failure' }]],

  /* ---------- Shared settings for every project ---------- */
  use: {
    baseURL: config.baseUrl,
    headless: config.headless,
    ignoreHTTPSErrors: config.ignoreHttpsErrors,
    actionTimeout: config.timeouts.action,
    navigationTimeout: config.timeouts.navigation,
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: config.ci ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: config.ci ? 'retain-on-failure' : 'off',
    testIdAttribute: 'data-test',
  },

  metadata: {
    environment: config.name,
    baseUrl: config.baseUrl,
    apiBaseUrl: config.apiBaseUrl,
  },

  projects: [
    /* Authenticates via API once and saves storage state for UI projects. */
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
    },

    /* Pure API tests – no browser, fastest feedback. */
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: config.apiBaseUrl },
    },

    /* Desktop + mobile + tablet UI projects generated from the device matrix. */
    ...allProfiles.map(toUiProject),
  ],
});
