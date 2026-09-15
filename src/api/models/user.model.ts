export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface RegisterUserRequest {
  first_name: string;
  last_name: string;
  address: Address;
  phone: string;
  dob: string; // YYYY-MM-DD
  email: string;
  password: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  address: Address;
  phone: string;
  dob: string;
  email: string;
  role?: 'user' | 'admin';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer' | string;
  expires_in: number;
}

/** Credentials of a user the framework created – handed to UI tests. */
export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
