import { sessionTest as base } from './session.fixture';
import { AccountPage, CartPage, HomePage, LoginPage, ProductPage } from '@pages/index';

export interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  accountPage: AccountPage;
}

/**
 * Page objects as fixtures: tests receive ready-to-use instances and never `new` them.
 * All page objects share the same `page`, so combining them with `session`/`authenticatedPage`
 * works out of the box.
 */
export const pagesTest = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
});
