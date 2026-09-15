import type { Locator, Page } from '@playwright/test';

/**
 * Site-wide navigation bar.
 *
 * Responsive behaviour: below the `lg` breakpoint the links live inside a collapsed
 * Bootstrap menu behind a hamburger button. `openNavigationIfCollapsed()` hides that
 * difference so tests can call `header.goToSignIn()` on any device profile.
 */
export class HeaderComponent {
  readonly root: Locator;
  readonly hamburger: Locator;
  readonly collapsibleMenu: Locator;
  readonly homeLink: Locator;
  readonly signInLink: Locator;
  readonly cartLink: Locator;
  readonly cartQuantity: Locator;
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly myAccountLink: Locator;

  constructor(page: Page) {
    this.root = page.locator('nav.navbar');
    this.hamburger = this.root.locator('button.navbar-toggler');
    this.collapsibleMenu = this.root.locator('#navbarSupportedContent');
    this.homeLink = page.getByTestId('nav-home');
    this.signInLink = page.getByTestId('nav-sign-in');
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOutLink = page.getByTestId('nav-sign-out');
    this.myAccountLink = page.getByTestId('nav-my-account');
  }

  async isCollapsedNavigation(): Promise<boolean> {
    return this.hamburger.isVisible();
  }

  /** Expands the mobile menu when needed; no-op on desktop. */
  async openNavigationIfCollapsed(): Promise<void> {
    if (!(await this.isCollapsedNavigation())) return;
    const expanded = await this.hamburger.getAttribute('aria-expanded');
    if (expanded !== 'true') {
      await this.hamburger.click();
      // Bootstrap animates the collapse; the first link becoming visible marks completion.
      await this.homeLink.waitFor({ state: 'visible' });
    }
  }

  async goToSignIn(): Promise<void> {
    await this.openNavigationIfCollapsed();
    await this.signInLink.click();
  }

  async goToCart(): Promise<void> {
    await this.openNavigationIfCollapsed();
    await this.cartLink.click();
  }

  async openUserMenu(): Promise<void> {
    await this.openNavigationIfCollapsed();
    await this.userMenu.click();
  }

  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.signOutLink.click();
  }

  /** Text of the user dropdown, e.g. "Jane Doe". Opens the mobile menu if required. */
  async loggedInUserName(): Promise<string> {
    await this.openNavigationIfCollapsed();
    return (await this.userMenu.textContent())?.trim() ?? '';
  }
}
