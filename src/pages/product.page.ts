import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { parsePrice } from '@utils/helpers';

export class ProductPage extends BasePage {
  protected readonly path = '/product';

  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantityInput: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToFavoritesButton: Locator;
  readonly outOfStockBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantityInput = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.decreaseQuantity = page.getByTestId('decrease-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
    this.outOfStockBadge = page.getByTestId('out-of-stock');
  }

  protected readyLocator(): Locator {
    return this.addToCartButton;
  }

  /** Direct navigation to a product by id – `goto()` on this page requires an id. */
  async gotoProduct(id: string): Promise<this> {
    await this.page.goto(`${this.path}/${id}`, { waitUntil: 'commit' });
    await this.expectLoaded();
    return this;
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) await this.setQuantity(quantity);
    await this.addToCartButton.click();
    await this.toast.success.waitFor({ state: 'visible' });
  }

  async price(): Promise<number> {
    return parsePrice((await this.unitPrice.textContent()) ?? '');
  }
}
