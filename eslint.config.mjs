// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'reports/**', 'test-results/**', '.auth/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'src/fixtures/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-skipped-test': 'warn',
    },
  },
  {
    // Setup scripts legitimately branch on configuration (e.g. provided vs generated credentials).
    files: ['tests/setup/**/*.ts'],
    rules: { 'playwright/no-conditional-in-test': 'off' },
  },
  {
    // Responsive specs skip by form factor on purpose – the skip is the assertion of scope.
    files: ['tests/ui/**/*.spec.ts'],
    rules: { 'playwright/no-skipped-test': 'off' },
  },
  prettier,
);
