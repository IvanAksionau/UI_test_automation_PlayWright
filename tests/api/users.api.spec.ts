import { test, expect } from '@fixtures';
import { ApiError } from '@api/index';
import { buildRegisterUser } from '@data/factories/user.factory';
import { INVALID_CREDENTIALS } from '@data/test-data';

test.describe('Users API', { tag: ['@api', '@regression'] }, () => {
  test('registers a new user and returns the profile without the password', async ({ api }) => {
    const payload = buildRegisterUser();
    const created = await api.users.register(payload);

    expect(created.id).toEqual(expect.any(String));
    expect(created).toMatchObject({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    });
    expect(created).not.toHaveProperty('password');
  });

  test('rejects registration with an already used email', async ({ api, testUser }) => {
    const duplicate = buildRegisterUser({ email: testUser.email });

    await expect(api.users.register(duplicate)).rejects.toThrow(ApiError);
    await expect(api.users.register(duplicate)).rejects.toMatchObject({ status: 409 });
  });

  test('logs in with valid credentials and can read own profile', async ({ api, testUser }) => {
    const login = await api.users.login({ email: testUser.email, password: testUser.password });
    expect(login.access_token).toEqual(expect.any(String));
    expect(login.token_type.toLowerCase()).toBe('bearer');

    api.setToken(login.access_token);
    const me = await api.users.me();
    expect(me).toMatchObject({ id: testUser.id, email: testUser.email, first_name: testUser.firstName });
  });

  test('rejects login with invalid credentials', async ({ api }) => {
    await expect(api.users.login(INVALID_CREDENTIALS)).rejects.toMatchObject({ status: 401 });
  });

  test('rejects profile access without a token', async ({ api }) => {
    await expect(api.users.me()).rejects.toMatchObject({ status: 401 });
  });

  test('authenticated client is reusable across resources', async ({ userApi }) => {
    const me = await userApi.users.me();
    const cartId = await userApi.carts.create();
    const cart = await userApi.carts.getById(cartId);

    expect(me.id).toBeTruthy();
    expect(cart.id).toBe(cartId);
    expect(cart.cart_items).toEqual([]);
  });
});
