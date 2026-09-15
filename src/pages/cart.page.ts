import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '@utils/helpers';

export interface CartLine {
  title: string;
  quantity: number;
  unitPrice: number;
  linePrice: number;
}

/** Step 1 of the checkout wizard – the shopping cart table. */
export class CartPage extends BasePage {
  protected readonly path = '/checkout';

  readonly rows: Locator;
  readonly productTitles: Locator;
  readonly quantityInputs: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;
  readonly continueShoppingButton: Locator;
  readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.locator('tbody tr').filter({ has: page.getByTestId('product-title') });
    this.productTitles = page.getByTestId('product-title');
    this.quantityInputs = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  protected readyLocator(): Locator {
    return this.proceedButton;
  }

  row(productTitle: string): Locator {
    return this.rows.filter({
      has: this.page.getByTestId('product-title').getByText(productTitle, { exact: true }),
    });
  }

  async lines(): Promise<CartLine[]> {
    const count = await this.rows.count();
    const lines: CartLine[] = [];
    for (let i = 0; i < count; i++) {
      const row = this.rows.nth(i);
      lines.push({
        title: ((await row.getByTestId('product-title').textContent()) ?? '').trim(),
        quantity: Number(await row.getByTestId('product-quantity').inputValue()),
        unitPrice: parsePrice((await row.getByTestId('product-price').textContent()) ?? ''),
        linePrice: parsePrice((await row.getByTestId('line-price').textContent()) ?? ''),
      });
    }
    return lines;
  }

  async totalAmount(): Promise<number> {
    return parsePrice((await this.total.textContent()) ?? '');
  }

  async removeLine(productTitle: string): Promise<void> {
    await this.row(productTitle)
      .locator('a, button')
      .filter({ has: this.page.locator('.fa-remove, .fa-trash, svg') })
      .first()
      .click();
  }
}
