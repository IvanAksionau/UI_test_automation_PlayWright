export interface CreateCartResponse {
  id: string;
}

export interface AddCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  discount_percentage: number | null;
  product?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Cart {
  id: string;
  lat: number | null;
  lng: number | null;
  additional_discount_percentage: number | null;
  cart_items: CartItem[];
}
