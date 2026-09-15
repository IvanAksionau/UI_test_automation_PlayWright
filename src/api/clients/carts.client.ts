import { BaseApiClient } from '../core/base-client';
import type { AddCartItemRequest, Cart, CreateCartResponse } from '../models';

export class CartsClient extends BaseApiClient {
  async create(): Promise<string> {
    const { id } = await this.post<CreateCartResponse>('/carts', undefined, { expectedStatus: 201 });
    return id;
  }

  async addItem(cartId: string, item: AddCartItemRequest): Promise<void> {
    await this.post<unknown>(`/carts/${cartId}`, item, { expectedStatus: [200, 201] });
  }

  async getById(cartId: string): Promise<Cart> {
    return this.get<Cart>(`/carts/${cartId}`);
  }

  async updateQuantity(cartId: string, productId: string, quantity: number): Promise<void> {
    await this.put<unknown>(`/carts/${cartId}/product/quantity`, { product_id: productId, quantity });
  }

  async removeItem(cartId: string, productId: string): Promise<void> {
    await this.delete<void>(`/carts/${cartId}/product/${productId}`, { expectedStatus: 204 });
  }

  async remove(cartId: string): Promise<void> {
    await this.delete<void>(`/carts/${cartId}`, { expectedStatus: 204 });
  }
}
