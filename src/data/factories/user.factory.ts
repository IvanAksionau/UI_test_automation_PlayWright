import { faker } from '@faker-js/faker';
import type { RegisterUserRequest } from '@api/models';
import { uniqueSuffix } from '@utils/helpers';

/**
 * Builds a valid registration payload with random but realistic data.
 * Every field can be overridden – e.g. `buildRegisterUser({ email: 'fixed@x.io' })`.
 *
 * Passwords are generated to satisfy the backend policy (length, mixed case, digit,
 * symbol) and include a random segment so they never appear in leaked-password lists.
 */
export function buildRegisterUser(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    first_name: firstName,
    last_name: lastName,
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: faker.location.zipCode('#####'),
    },
    phone: faker.string.numeric(10),
    dob: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString().slice(0, 10),
    email: `qa.${firstName}.${lastName}.${uniqueSuffix()}@example.com`.toLowerCase(),
    password: buildStrongPassword(),
    ...overrides,
  };
}

export function buildStrongPassword(): string {
  const upper = faker.string.alpha({ length: 3, casing: 'upper' });
  const lower = faker.string.alpha({ length: 5, casing: 'lower' });
  const digits = faker.string.numeric(3);
  const symbols = faker.helpers.arrayElements(['!', '@', '#', '$', '%', '&', '*'], 2).join('');
  return faker.helpers.shuffle([...`${upper}${lower}${digits}${symbols}`]).join('');
}
