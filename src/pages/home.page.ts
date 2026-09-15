import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ProductPage } from './product.page';

export type SortOption = 'name,asc' | 'name,desc' | 'price,desc' | 'price,asc';

/**
 * Landing page: product grid with search, sort and filters.
 * On mobile the filter/search sidebar is collapsed behind a "Filters" link.
 */
export class HomePage extends BasePage {
  protected readonly path = '/';

  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly filtersPanel: Locator;
  readonly filtersToggle: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly searchCaption: Locator;
  readonly searchResultCount: Locator;
  readonly noResults: Locator;
  readonly sortSelect: Locator;
  readonly paginationNext: Locator;

  constructor(page: ConstructorParameters<typeof BasePage>[0]) {
    super(page);
    this.productCards = page.locator('a.card[data-test^="product-"]');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.filtersPanel = page.locator('div[data-test="filters"]');
    this.filtersToggle = page.locator('a[data-test="filters"]');
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchReset = page.getByTestId('search-reset');
    this.searchCaption = page.getByTestId('search-caption');
    this.searchResultCount = page.getByTestId('search-result-count');
    this.noResults = page.getByTestId('no-results');
    this.sortSelect = page.getByTestId('sort');
    this.paginationNext = page.getByTestId('pagination-next');
  }

  protected readyLocator(): Locator {
    return this.productCards.first();
  }

  /** Expands the filter sidebar on small screens; no-op on desktop where it's always visible. */
  async openFiltersIfCollapsed(): Promise<void> {
    if (await this.searchInput.isVisible()) return;
    await this.filtersToggle.click();
    await this.searchInput.waitFor({ state: 'visible' });
  }

  async search(term: string): Promise<void> {
    await this.openFiltersIfCollapsed();
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
    await this.searchCaption.waitFor({ state: 'visible' });
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.openFiltersIfCollapsed();
    await this.sortSelect.selectOption(option);
  }

  productCard(name: string): Locator {
    return this.productCards.filter({
      has: this.page.getByTestId('product-name').getByText(name, { exact: true }),
    });
  }

  productCardById(id: string): Locator {
    return this.page.getByTestId(`product-${id}`);
  }

  async openProduct(name: string): Promise<ProductPage> {
    await this.productCard(name).first().click();
    const product = new ProductPage(this.page);
    await product.expectLoaded();
    return product;
  }

  async openProductById(id: string): Promise<ProductPage> {
    await this.productCardById(id).click();
    const product = new ProductPage(this.page);
    await product.expectLoaded();
    return product;
  }

  async visibleProductNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }
}
