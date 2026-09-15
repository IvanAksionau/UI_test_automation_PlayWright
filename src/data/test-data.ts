/**
 * Static, environment-independent test data.
 * Anything that depends on backend state (users, carts, ids) must be created
 * through the API layer at runtime instead of hard-coding it here.
 */
export const KNOWN_PRODUCTS = {
  pliers: 'Pliers',
  hammer: 'Hammer',
} as const;

export const INVALID_CREDENTIALS = {
  email: 'nobody@example.com',
  password: 'definitely-wrong-password',
} as const;

export const SEARCH_TERMS = {
  matching: 'pliers',
  noResults: 'zzz-no-such-product-zzz',
} as const;

/**
 * Responsive breakpoints of the application (Bootstrap defaults, in CSS px).
 * - below `md`: filter sidebar collapses behind a "Filters" toggle
 * - below `lg`: navigation collapses behind a hamburger
 */
export const BREAKPOINTS = {
  md: 768,
  lg: 992,
} as const;

/** Tags used with `--grep` to slice the suite. Keep in sync with docs/GUIDE.md. */
export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  mobile: '@mobile',
  desktopOnly: '@desktop-only',
} as const;
