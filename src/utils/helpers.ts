/**
 * Retries an async operation with a fixed delay. Use it for backend calls in
 * test-data preparation where eventual consistency is expected – never for UI
 * assertions (use `expect.poll` / web-first assertions for those).
 */
export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 3, delayMs = 500, label = 'operation' } = {},
): Promise<T> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) await sleep(delayMs);
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${String(lastError)}`);
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Short unique suffix for test data names/emails so parallel workers never collide. */
export const uniqueSuffix = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Parses a formatted price like "$12.34" or "12,34 €" into a number. */
export const parsePrice = (text: string): number => Number(text.replace(/[^\d.,-]/g, '').replace(',', '.'));
