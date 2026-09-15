import { BaseApiClient } from '../core/base-client';
import type { LoginRequest, LoginResponse, RegisterUserRequest, User } from '../models';

export class UsersClient extends BaseApiClient {
  /** Registers a new customer account. Returns the created user (without password). */
  async register(payload: RegisterUserRequest): Promise<User> {
    return this.post<User>('/users/register', payload, { expectedStatus: 201 });
  }

  /** Authenticates and returns the raw token response (does NOT store the token). */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.post<LoginResponse>('/users/login', credentials, { expectedStatus: 200 });
  }

  /** Logs in and attaches the token to this client for subsequent calls. */
  async authenticate(credentials: LoginRequest): Promise<string> {
    const { access_token } = await this.login(credentials);
    this.setToken(access_token);
    return access_token;
  }

  /** Returns the currently authenticated user's profile. */
  async me(): Promise<User> {
    return this.get<User>('/users/me');
  }

  async logout(): Promise<void> {
    await this.get<unknown>('/users/logout');
    this.setToken(undefined);
  }

  /** Admin-only: deletes a user. Used for test data cleanup when admin credentials are available. */
  async deleteUser(id: string): Promise<void> {
    await this.delete<void>(`/users/${id}`, { expectedStatus: 204 });
  }
}
