/**
 * Device / viewport matrix used to build Playwright projects.
 *
 * Two kinds of entries:
 *  - Built-in Playwright device descriptors (real UA strings, DPR, touch, mobile flag).
 *  - Custom viewports for breakpoints the product team cares about but which have
 *    no descriptor (e.g. the smallest supported phone at 320px).
 *
 * Add a new device here and it becomes available as a Playwright project automatically.
 */
import { devices, type PlaywrightTestConfig } from '@playwright/test';

type ProjectUse = NonNullable<PlaywrightTestConfig['use']>;

export interface DeviceProfile {
  /** Playwright project name (used with `--project=<name>`). */
  name: string;
  /** Browser engine required by the descriptor. */
  engine: 'chromium' | 'firefox' | 'webkit';
  /** Form factor tag – used for `test.skip`/`grep` decisions. */
  formFactor: 'desktop' | 'mobile' | 'tablet';
  use: ProjectUse;
}

export const desktopProfiles: DeviceProfile[] = [
  {
    name: 'chromium-desktop',
    engine: 'chromium',
    formFactor: 'desktop',
    use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
  },
  {
    name: 'firefox-desktop',
    engine: 'firefox',
    formFactor: 'desktop',
    use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } },
  },
  {
    name: 'webkit-desktop',
    engine: 'webkit',
    formFactor: 'desktop',
    use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
  },
];

export const mobileProfiles: DeviceProfile[] = [
  {
    name: 'mobile-chrome-pixel7',
    engine: 'chromium',
    formFactor: 'mobile',
    use: { ...devices['Pixel 7'] },
  },
  {
    name: 'mobile-safari-iphone14',
    engine: 'webkit',
    formFactor: 'mobile',
    use: { ...devices['iPhone 14'] },
  },
  {
    // Smallest breakpoint the app must support – no built-in descriptor, so we
    // reuse the Pixel UA/touch settings and override the viewport.
    name: 'mobile-small-320',
    engine: 'chromium',
    formFactor: 'mobile',
    use: {
      ...devices['Pixel 7'],
      viewport: { width: 320, height: 568 },
      deviceScaleFactor: 2,
    },
  },
  {
    name: 'tablet-ipad',
    engine: 'webkit',
    formFactor: 'tablet',
    use: { ...devices['iPad (gen 7)'] },
  },
];

export const allProfiles: DeviceProfile[] = [...desktopProfiles, ...mobileProfiles];

export const profileByName = (name: string): DeviceProfile | undefined =>
  allProfiles.find((p) => p.name === name);
