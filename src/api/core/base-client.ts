import type { APIRequestContext, APIResponse } from '@playwright/test';
import { test } from '@playwright/test';
import { createLogger } from '@utils/logger';
import { ApiError } from './api-error';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  /** Status codes considered successful. Default: any 2xx. */
  expectedStatus?: number | number[];
}

const log = createLogger('api');

/**
 * Thin wrapper around Playwright's `APIRequestContext`.
 *
 * Responsibilities:
 *  - prefix relative paths with the environment API base URL
 *  - attach the bearer token when the client has been authenticated
 *  - validate the status code and raise a rich `ApiError` on mismatch
 *  - log every request (secrets redacted) and wrap it in a `test.step`
 *    so API calls made during data preparation show up in the HTML report/trace.
 */
export abstract class BaseApiClient {
  private token?: string;

  constructor(
    protected readonly request: APIRequestContext,
    protected readonly baseUrl: string,
  ) {}

  /** Attach a bearer token for subsequent requests. */
  setToken(token: string | undefined): void {
    this.token = token;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  protected async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>('GET', path, undefined, options);
  }

  protected async post<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>('POST', path, body, options);
  }

  protected async put<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>('PUT', path, body, options);
  }

  protected async patch<T>(path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>('PATCH', path, body, options);
  }

  protected async delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>('DELETE', path, undefined, options);
  }

  /** Low-level access when a test needs the raw `APIResponse` (headers, status…). */
  protected async raw(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<APIResponse> {
    const url = this.buildUrl(path, options.params);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    log.debug(`${method} ${url}`, body !== undefined ? { body } : undefined);
    const response = await this.request.fetch(url, {
      method,
      headers,
      data: body !== undefined ? JSON.stringify(body) : undefined,
    });
    log.debug(`${method} ${url} -> ${response.status()}`);
    return response;
  }

  private async send<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options: RequestOptions,
  ): Promise<T> {
    return test.step(
      `API ${method} ${path}`,
      async () => {
        const response = await this.raw(method, path, body, options);
        await this.assertStatus(method, response, options.expectedStatus);
        return this.parseBody<T>(response);
      },
      { box: true },
    );
  }

  private async assertStatus(
    method: string,
    response: APIResponse,
    expected?: number | number[],
  ): Promise<void> {
    const status = response.status();
    const ok =
      expected === undefined
        ? status >= 200 && status < 300
        : Array.isArray(expected)
          ? expected.includes(status)
          : expected === status;
    if (!ok) {
      const body = await this.parseBody<unknown>(response).catch(() => '<unparsable body>');
      throw new ApiError(method, response.url(), status, body);
    }
  }

  private async parseBody<T>(response: APIResponse): Promise<T> {
    const text = await response.text();
    if (!text) return undefined as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private buildUrl(path: string, params?: QueryParams): string {
    const url = new URL(
      path.startsWith('http') ? path : `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`,
    );
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
}
