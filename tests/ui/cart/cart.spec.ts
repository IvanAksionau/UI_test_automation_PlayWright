import { test, expect } from '@fixtures';

test.describe('Shopping cart', { tag: ['@cart'] }, () => {
  test(
    'adding a product from the product page updates the cart badge',
    { tag: '@smoke' },
    async ({ productPage, api }) => {
      const product = await api.products.findAvailable();

      await productPage.gotoProduct(product.id);
      await productPage.addToCart();

      await expect(productPage.toast.message).toHaveText(/added to shopping cart/i);
      await productPage.header.openNavigationIfCollapsed();
      await expect(productPage.header.cartQuantity).toHaveText('1');
    },
  );

  test(
    'cart page reflects a cart prepared via API',
    { tag: '@smoke' },
    async ({ session, cartPage, api }) => {
      const [first, second] = (await api.products.list({ sort: 'price,asc' })).data.filter(
        (p) => p.in_stock !== false,
      );
      await session.seedCart([
        { product_id: first.id, quantity: 2 },
        { product_id: second.id, quantity: 1 },
      ]);

      await cartPage.goto();

      const lines = await cartPage.lines();
      expect(lines).toHaveLength(2);
      expect(lines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: first.name, quantity: 2 }),
          expect.objectContaining({ title: second.name, quantity: 1 }),
        ]),
      );

      const expectedTotal = lines.reduce((sum, l) => sum + l.linePrice, 0);
      expect(await cartPage.totalAmount()).toBeCloseTo(expectedTotal, 2);
      await expect(cartPage.header.cartQuantity).toHaveText('3');
    },
  );

  test(
    'line price equals unit price times quantity',
    { tag: '@regression' },
    async ({ session, cartPage, api }) => {
      const product = await api.products.findAvailable();
      await session.seedCart([{ product_id: product.id, quantity: 3 }]);

      await cartPage.goto();

      const [line] = await cartPage.lines();
      expect(line.title).toBe(product.name);
      expect(line.quantity).toBe(3);
      expect(line.linePrice).toBeCloseTo(line.unitPrice * 3, 2);
    },
  );

  test(
    'logged-in user sees a prepared cart',
    { tag: '@regression' },
    async ({ authenticatedPage, defaultUser, session, cartPage, api }) => {
      const product = await api.products.findAvailable();
      await session.seedCart([{ product_id: product.id, quantity: 1 }]);

      await cartPage.goto();

      await expect(cartPage.productTitles).toHaveText([product.name]);
      expect(await cartPage.header.loggedInUserName()).toBe(
        `${defaultUser.firstName} ${defaultUser.lastName}`,
      );
      expect(authenticatedPage.url()).toContain('/checkout');
    },
  );
});
