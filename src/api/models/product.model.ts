export interface Paginated<T> {
  current_page: number;
  data: T[];
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sub_categories?: Category[];
}

export interface ProductImage {
  by_name: string;
  by_url: string;
  source_name: string;
  source_url: string;
  file_name: string;
  title: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock?: boolean;
  brand?: Brand;
  category?: Category;
  product_image?: ProductImage;
}

export interface ProductSearchParams {
  q?: string;
  page?: number;
  by_brand?: string;
  by_category?: string;
  sort?: 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';
  between?: string; // e.g. "price,1,100"
}
