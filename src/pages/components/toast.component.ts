import type { Locator, Page } from '@playwright/test';

/** ngx-toastr notifications rendered in the top-right corner. */
export class ToastComponent {
  readonly container: Locator;
  readonly message: Locator;
  readonly success: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.container = page.locator('#toast-container');
    this.message = this.container.getByRole('alert');
    this.success = this.container.locator('.toast-success');
    this.error = this.container.locator('.toast-error');
  }
}
