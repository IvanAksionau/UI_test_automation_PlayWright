import type { APIRequestContext } from '@playwright/test';
import { config } from '@config/env';
import { CartsClient } from './clients/carts.client';
import { ProductsClient } from './clients/products.client';
import { UsersClient } from './clients/users.client';
import type { LoginRequest } from './models';

/**
 * Facade grouping all resource clients behind one object.
 *
 * `authenticate()` logs in once and shares the token with every sub-client, so a test
 * can do `await api.authenticate(user)` and then call `api.carts.create()` etc.
 */
export class ApiClient {
  readonly users: UsersClient;
  readonly products: ProductsClient;
  readonly carts: CartsClient;

  private readonly clients: readonly [UsersClient, ProductsClient, CartsClient];

  constructor(request: APIRequestContext, baseUrl: string = config.apiBaseUrl) {
    this.users = new UsersClient(request, baseUrl);
    this.products = new ProductsClient(request, baseUrl);
    this.carts = new CartsClient(request, baseUrl);
    this.clients = [this.users, this.products, this.carts];
  }

  /** Logs in and propagates the bearer token to all clients. Returns the token. */
  async authenticate(credentials: LoginRequest): Promise<string> {
    const token = await this.users.authenticate(credentials);
    this.setToken(token);
    return token;
  }

  setToken(token: string | undefined): void {
    for (const client of this.clients) client.setToken(token);
  }
}
