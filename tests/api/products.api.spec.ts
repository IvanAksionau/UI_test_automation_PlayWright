import { test, expect } from '@fixtures';
import { SEARCH_TERMS } from '@data/test-data';

test.describe('Products API', { tag: ['@api', '@smoke'] }, () => {
  test('lists products with pagination metadata', async ({ api }) => {
    const page = await api.products.list({ page: 1 });

    expect(page.current_page).toBe(1);
    expect(page.data.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThanOrEqual(page.data.length);
    for (const product of page.data) {
      expect(product.id).toEqual(expect.any(String));
      expect(product.name).toEqual(expect.any(String));
      expect(product.price).toEqual(expect.any(Number));
    }
  });

  test('search returns only matching products', async ({ api }) => {
    const result = await api.products.search(SEARCH_TERMS.matching);

    expect(result.data.length).toBeGreaterThan(0);
    for (const product of result.data) {
      expect(product.name.toLowerCase()).toContain(SEARCH_TERMS.matching);
    }
  });

  test('search with no matches returns an empty page', async ({ api }) => {
    const result = await api.products.search(SEARCH_TERMS.noResults);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  test('returns product details by id', async ({ api }) => {
    const [first] = (await api.products.list()).data;
    const product = await api.products.getById(first.id);

    expect(product).toMatchObject({ id: first.id, name: first.name, price: first.price });
    expect(product.description.length).toBeGreaterThan(0);
  });

  test('sorts products by price ascending', async ({ api }) => {
    const { data } = await api.products.list({ sort: 'price,asc' });
    const prices = data.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});
