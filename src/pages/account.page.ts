import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountPage extends BasePage {
  protected readonly path = '/account';

  readonly title: Locator;
  readonly favoritesLink: Locator;
  readonly profileLink: Locator;
  readonly invoicesLink: Locator;
  readonly messagesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('page-title');
    this.favoritesLink = page.getByTestId('nav-favorites');
    this.profileLink = page.getByTestId('nav-profile');
    this.invoicesLink = page.getByTestId('nav-invoices');
    this.messagesLink = page.getByTestId('nav-messages');
  }

  protected readyLocator(): Locator {
    return this.title;
  }
}
