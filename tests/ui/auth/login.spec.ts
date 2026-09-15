import { test, expect } from '@fixtures';
import { INVALID_CREDENTIALS } from '@data/test-data';

test.describe('Login', { tag: ['@auth'] }, () => {
  test(
    'user created via API can sign in through the UI',
    { tag: '@smoke' },
    async ({ loginPage, testUser }) => {
      await loginPage.goto();
      const accountPage = await loginPage.loginAs(testUser.email, testUser.password);

      await expect(accountPage.title).toHaveText('My account');
      // `loggedInUserName()` expands the collapsed navigation on mobile automatically.
      expect(await accountPage.header.loggedInUserName()).toBe(`${testUser.firstName} ${testUser.lastName}`);
    },
  );

  test('shows an error for invalid credentials', { tag: '@regression' }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.submit(INVALID_CREDENTIALS.email, INVALID_CREDENTIALS.password);

    await expect(loginPage.errorMessage).toHaveText(/invalid email or password/i);
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test(
    'navigates to sign-in from the header on any form factor',
    { tag: '@regression' },
    async ({ page, homePage, loginPage }) => {
      await homePage.goto();
      await homePage.header.goToSignIn();

      await loginPage.expectLoaded();
      await expect(page).toHaveURL(/\/auth\/login$/);
    },
  );

  test(
    'authenticated session is injected without UI login',
    { tag: '@smoke' },
    async ({ authenticatedPage, accountPage, defaultUser }) => {
      await accountPage.goto();

      await expect(accountPage.title).toHaveText('My account');
      expect(await accountPage.header.loggedInUserName()).toBe(
        `${defaultUser.firstName} ${defaultUser.lastName}`,
      );
      expect(authenticatedPage.url()).toContain('/account');
    },
  );

  test('user can sign out', { tag: '@regression' }, async ({ authenticatedPage, accountPage, loginPage }) => {
    await accountPage.goto();
    await accountPage.header.signOut();

    // The app redirects to the login page after signing out.
    await loginPage.expectLoaded();
    await expect(authenticatedPage).toHaveURL(/\/auth\/login$/);
    await loginPage.header.openNavigationIfCollapsed();
    await expect(loginPage.header.signInLink).toBeVisible();
    await expect(loginPage.header.userMenu).toBeHidden();
  });
});
