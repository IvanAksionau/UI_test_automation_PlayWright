import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { AccountPage } from './account.page';

export class LoginPage extends BasePage {
  protected readonly path = '/auth/login';

  readonly form: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
    this.registerLink = page.getByTestId('register-link');
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');
  }

  protected readyLocator(): Locator {
    return this.form;
  }

  /** Fills and submits the form. Does not assert the outcome – use `loginAs` for the happy path. */
  async submit(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Happy-path login: submits and waits for the account page. */
  async loginAs(email: string, password: string): Promise<AccountPage> {
    await this.submit(email, password);
    const account = new AccountPage(this.page);
    await account.expectLoaded();
    return account;
  }
}
