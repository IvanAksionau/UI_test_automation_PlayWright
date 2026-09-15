import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { ToastComponent } from './components/toast.component';

/**
 * Common behaviour for every page object.
 *
 * Conventions:
 *  - Page objects expose *locators* (lazy, auto-waiting) and *actions*, never raw selectors.
 *  - Assertions live in tests, except for `expectLoaded()` which guards navigation.
 *  - Selectors prefer `getByTestId` (mapped to `data-test` in playwright.config.ts) and
 *    role-based queries; CSS/XPath is a last resort.
 */
export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly toast: ToastComponent;

  /** Relative URL path of the page, e.g. `/auth/login`. */
  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.toast = new ToastComponent(page);
  }

  /** A locator that is only visible once the page has finished rendering its main content. */
  protected abstract readyLocator(): Locator;

  /**
   * Navigate to the page. We wait for `commit` instead of `load` because the target app
   * has long-running third-party scripts that delay the `load` event; readiness is then
   * asserted through `readyLocator()` – a far more reliable signal for SPAs.
   */
  async goto(options: { query?: Record<string, string> } = {}): Promise<this> {
    const url = options.query ? `${this.path}?${new URLSearchParams(options.query)}` : this.path;
    await this.page.goto(url, { waitUntil: 'commit' });
    await this.expectLoaded();
    return this;
  }

  async expectLoaded(): Promise<void> {
    await expect(this.readyLocator()).toBeVisible();
  }

  /** Bootstrap `lg` breakpoint – below it the app collapses navigation into a hamburger. */
  async isMobileLayout(): Promise<boolean> {
    return this.header.isCollapsedNavigation();
  }

  url(): string {
    return this.page.url();
  }
}
