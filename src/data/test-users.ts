import type { ApiClient, RegisterUserRequest, TestUser } from '@api/index';
import { buildRegisterUser } from './factories/user.factory';

/**
 * Creates a brand-new customer through the backend API and returns credentials
 * that UI tests can use. This is the canonical way to obtain a user – never
 * hard-code accounts, they drift between environments and break parallel runs.
 */
export async function createTestUser(
  api: ApiClient,
  overrides: Partial<RegisterUserRequest> = {},
): Promise<TestUser> {
  const payload = buildRegisterUser(overrides);
  const created = await api.users.register(payload);
  return {
    id: created.id,
    email: payload.email,
    password: payload.password,
    firstName: payload.first_name,
    lastName: payload.last_name,
  };
}
