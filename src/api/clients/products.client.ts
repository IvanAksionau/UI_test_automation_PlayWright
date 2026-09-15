import { BaseApiClient } from '../core/base-client';
import type { Brand, Category, Paginated, Product, ProductSearchParams } from '../models';

export class ProductsClient extends BaseApiClient {
  async list(params: ProductSearchParams = {}): Promise<Paginated<Product>> {
    return this.get<Paginated<Product>>('/products', { params: { ...params } });
  }

  async search(query: string, page = 1): Promise<Paginated<Product>> {
    return this.get<Paginated<Product>>('/products/search', { params: { q: query, page } });
  }

  async getById(id: string): Promise<Product> {
    return this.get<Product>(`/products/${id}`);
  }

  async related(id: string): Promise<Product[]> {
    return this.get<Product[]>(`/products/${id}/related`);
  }

  async brands(): Promise<Brand[]> {
    return this.get<Brand[]>('/brands');
  }

  async categoryTree(): Promise<Category[]> {
    return this.get<Category[]>('/categories/tree');
  }

  /**
   * Convenience helper for test data: returns the first in-stock product,
   * optionally filtered by a name fragment.
   */
  async findAvailable(nameContains?: string): Promise<Product> {
    const page = nameContains ? await this.search(nameContains) : await this.list();
    const product = page.data.find((p) => p.in_stock !== false) ?? page.data[0];
    if (!product) {
      throw new Error(`No product found${nameContains ? ` matching "${nameContains}"` : ''}`);
    }
    return product;
  }
}
