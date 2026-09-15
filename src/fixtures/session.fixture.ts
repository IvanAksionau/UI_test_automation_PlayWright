import type { Page } from '@playwright/test';
import { userTest as base } from './user.fixture';
import type { AddCartItemRequest, TestUser } from '@api/index';
import { createLogger } from '@utils/logger';

const log = createLogger('fixture:session');

/**
 * Web Storage keys the application reads on boot. They are an implementation detail of the
 * app (see its `TokenStorageService` / `CartService`), so they live in exactly one place.
 * The token is persisted in `localStorage`, the cart in `sessionStorage`.
 */
type StorageArea = 'localStorage' | 'sessionStorage';
interface StorageEntry {
  area: StorageArea;
  key: string;
  value: string;
}

const STORAGE_KEYS = {
  token: { area: 'localStorage', key: 'auth-token' },
  cartId: { area: 'sessionStorage', key: 'cart_id' },
  cartQuantity: { area: 'sessionStorage', key: 'cart_quantity' },
} as const satisfies Record<string, Omit<StorageEntry, 'value'>>;

export interface SessionApi {
  /**
   * Authenticates `user` through the API and injects the token into the browser session
   * *before* the first navigation. Much faster and more stable than logging in via the UI
   * in every test; the UI login itself is covered by dedicated tests.
   */
  loginAs(user: TestUser): Promise<string>;
  /**
   * Creates a cart via API, adds the given items, and makes the browser pick it up.
   * Returns the cart id.
   */
  seedCart(items: AddCartItemRequest[]): Promise<string>;
}

export interface SessionFixtures {
  session: SessionApi;
  /** `page` with `defaultUser` already logged in (token injected). */
  authenticatedPage: Page;
}

export const sessionTest = base.extend<SessionFixtures>({
  session: async ({ context, api }, use) => {
    const seedStorage = async (entries: StorageEntry[]) => {
      // Init scripts run before any page script on every navigation, so the SPA sees the
      // values on boot. Each key is written only once per storage area (marker key), which
      // lets tests sign out / clear the cart afterwards without the script re-seeding it.
      await context.addInitScript((data: StorageEntry[]) => {
        for (const { area, key, value } of data) {
          const storage = window[area];
          const marker = `__seeded_${key}`;
          if (!storage.getItem(marker)) {
            storage.setItem(key, value);
            storage.setItem(marker, '1');
          }
        }
      }, entries);
    };

    const session: SessionApi = {
      async loginAs(user) {
        const { access_token } = await api.users.login({ email: user.email, password: user.password });
        await seedStorage([{ ...STORAGE_KEYS.token, value: access_token }]);
        log.debug('Injected auth token into browser session', { email: user.email });
        return access_token;
      },

      async seedCart(items) {
        const cartId = await api.carts.create();
        for (const item of items) await api.carts.addItem(cartId, item);
        const quantity = items.reduce((sum, i) => sum + i.quantity, 0);
        await seedStorage([
          { ...STORAGE_KEYS.cartId, value: cartId },
          { ...STORAGE_KEYS.cartQuantity, value: String(quantity) },
        ]);
        log.debug('Seeded cart', { cartId, items: items.length });
        return cartId;
      },
    };

    await use(session);
  },

  authenticatedPage: async ({ page, session, defaultUser }, use) => {
    await session.loginAs(defaultUser);
    await use(page);
  },
});
