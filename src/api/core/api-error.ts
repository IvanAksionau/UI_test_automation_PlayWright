/**
 * Raised when the backend answers with an unexpected status code.
 * Carries enough context (method, url, status, body) to debug a failing
 * data-preparation step straight from the test report.
 */
export class ApiError extends Error {
  constructor(
    public readonly method: string,
    public readonly url: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(
      `${method} ${url} -> ${status}\n${typeof body === 'string' ? body : JSON.stringify(body, null, 2)}`,
    );
    this.name = 'ApiError';
  }
}
