import { test, expect } from '@fixtures';
import { BREAKPOINTS, SEARCH_TERMS } from '@data/test-data';

test.describe('Product catalog', { tag: ['@catalog'] }, () => {
  test('home page lists the same products as the API', { tag: '@smoke' }, async ({ homePage, api }) => {
    const expected = (await api.products.list({ page: 1 })).data.map((p) => p.name);

    await homePage.goto();

    await expect(homePage.productCards).toHaveCount(expected.length);
    expect(await homePage.visibleProductNames()).toEqual(expected);
  });

  test('search shows the same results as the API', { tag: '@smoke' }, async ({ homePage, api }) => {
    // The backend matches on name *and* description, so the API is the oracle here.
    const expected = (await api.products.search(SEARCH_TERMS.matching)).data.map((p) => p.name);
    expect(expected.length).toBeGreaterThan(0);

    await homePage.goto();
    await homePage.search(SEARCH_TERMS.matching);

    await expect(homePage.searchCaption).toContainText(SEARCH_TERMS.matching);
    await expect(homePage.productCards).toHaveCount(expected.length);
    expect((await homePage.visibleProductNames()).sort()).toEqual([...expected].sort());
  });

  test('search without matches shows an empty state', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.goto();
    await homePage.search(SEARCH_TERMS.noResults);

    await expect(homePage.noResults).toBeVisible();
    await expect(homePage.productCards).toHaveCount(0);
  });

  test('sorting by price descending orders the grid', { tag: '@regression' }, async ({ homePage }) => {
    await homePage.goto();
    await homePage.sortBy('price,desc');

    await expect
      .poll(async () => {
        const prices = (await homePage.productPrices.allTextContents()).map((t) =>
          Number(t.replace(/[^\d.]/g, '')),
        );
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] >= p);
      })
      .toBe(true);
  });

  test('product details match the API', { tag: '@regression' }, async ({ homePage, productPage, api }) => {
    const product = await api.products.findAvailable();

    await homePage.goto();
    await homePage.openProductById(product.id);

    await expect(productPage.name).toHaveText(product.name);
    expect(await productPage.price()).toBeCloseTo(product.price, 2);
    await expect(productPage.description).toContainText(product.description.slice(0, 40));
  });
});

/**
 * Layout assertions depend on the *viewport width*, not on the device flag: a tablet is
 * `isMobile: true` yet wide enough to keep the filter sidebar expanded. The `viewport`
 * fixture reflects whatever the current project (device profile) configured.
 */
test.describe('Responsive layout', { tag: ['@catalog', '@mobile'] }, () => {
  test('navigation collapses into a hamburger below the lg breakpoint', async ({ homePage, viewport }) => {
    test.skip((viewport?.width ?? Infinity) >= BREAKPOINTS.lg, 'Navigation is expanded at this width');

    await homePage.goto();

    await expect(homePage.header.hamburger).toBeVisible();
    await expect(homePage.header.homeLink).toBeHidden();

    await homePage.header.openNavigationIfCollapsed();
    await expect(homePage.header.homeLink).toBeVisible();
  });

  test('filters are hidden behind a toggle below the md breakpoint', async ({ homePage, viewport }) => {
    test.skip((viewport?.width ?? Infinity) >= BREAKPOINTS.md, 'Filters are expanded at this width');

    await homePage.goto();

    await expect(homePage.searchInput).toBeHidden();
    await homePage.openFiltersIfCollapsed();
    await expect(homePage.searchInput).toBeVisible();
  });

  test('filters stay expanded from the md breakpoint upwards', async ({ homePage, viewport }) => {
    test.skip((viewport?.width ?? 0) < BREAKPOINTS.md, 'Filters are collapsed at this width');

    await homePage.goto();

    await expect(homePage.filtersToggle).toBeHidden();
    await expect(homePage.searchInput).toBeVisible();
  });

  test(
    'navigation stays expanded from the lg breakpoint upwards',
    { tag: '@desktop-only' },
    async ({ homePage, viewport }) => {
      test.skip((viewport?.width ?? 0) < BREAKPOINTS.lg, 'Navigation is collapsed at this width');

      await homePage.goto();

      await expect(homePage.header.hamburger).toBeHidden();
      await expect(homePage.header.homeLink).toBeVisible();
    },
  );
});
