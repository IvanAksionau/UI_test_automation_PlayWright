/**
 * Environment configuration loader.
 *
 * Resolution order (highest priority first):
 *   1. Process environment variables (e.g. BASE_URL, API_BASE_URL) – useful for CI overrides.
 *   2. `.env` file in the project root (loaded via dotenv, never committed).
 *   3. `config/environments/<TEST_ENV>.json` – the per-environment defaults.
 *
 * The resulting object is validated with zod so a typo in a JSON file or a missing
 * secret fails fast with a readable message instead of a cryptic runtime error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

export const SUPPORTED_ENVS = ['dev', 'staging', 'prod'] as const;
export type EnvName = (typeof SUPPORTED_ENVS)[number];

const EnvFileSchema = z.object({
  name: z.enum(SUPPORTED_ENVS),
  baseUrl: z.url(),
  apiBaseUrl: z.url(),
  timeouts: z.object({
    test: z.number().int().positive(),
    action: z.number().int().positive(),
    navigation: z.number().int().positive(),
    expect: z.number().int().positive(),
  }),
  retries: z.number().int().min(0),
  ignoreHttpsErrors: z.boolean().default(false),
  features: z.record(z.string(), z.boolean()).default({}),
});

const RuntimeSchema = z.object({
  /** Existing user credentials – optional; tests create their own users via API when absent. */
  adminEmail: z.string().email().optional(),
  adminPassword: z.string().min(1).optional(),
  /** `true` on CI – enables stricter retries/reporters. */
  ci: z.boolean(),
  headless: z.boolean(),
  workers: z.union([z.number().int().positive(), z.string()]).optional(),
  /** Log level for the framework logger. */
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvFileConfig = z.infer<typeof EnvFileSchema>;
export type RuntimeConfig = z.infer<typeof RuntimeSchema>;
export type AppConfig = EnvFileConfig & RuntimeConfig;

function readEnvFile(envName: EnvName): EnvFileConfig {
  const file = path.join(projectRoot, 'config', 'environments', `${envName}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Environment file not found: ${file}. Supported: ${SUPPORTED_ENVS.join(', ')}`);
  }
  const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const parsed = EnvFileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid environment file ${file}:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

function toBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function resolveEnvName(): EnvName {
  const requested = (process.env.TEST_ENV ?? 'staging').toLowerCase();
  if (!SUPPORTED_ENVS.includes(requested as EnvName)) {
    throw new Error(`Unknown TEST_ENV="${requested}". Supported values: ${SUPPORTED_ENVS.join(', ')}`);
  }
  return requested as EnvName;
}

function loadConfig(): AppConfig {
  const envName = resolveEnvName();
  const fileConfig = readEnvFile(envName);

  // Env-var overrides on top of the JSON defaults.
  const merged: EnvFileConfig = {
    ...fileConfig,
    baseUrl: process.env.BASE_URL ?? fileConfig.baseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? fileConfig.apiBaseUrl,
    retries: process.env.RETRIES !== undefined ? Number(process.env.RETRIES) : fileConfig.retries,
  };

  const runtime = RuntimeSchema.parse({
    adminEmail: process.env.ADMIN_EMAIL || undefined,
    adminPassword: process.env.ADMIN_PASSWORD || undefined,
    ci: toBool(process.env.CI, false),
    headless: toBool(process.env.HEADLESS, true),
    workers: process.env.WORKERS
      ? Number.isNaN(Number(process.env.WORKERS))
        ? process.env.WORKERS
        : Number(process.env.WORKERS)
      : undefined,
    logLevel: process.env.LOG_LEVEL || undefined,
  } satisfies Partial<Record<keyof RuntimeConfig, unknown>>);

  return { ...merged, ...runtime };
}

/** Singleton, evaluated once per process (Playwright config + every worker). */
export const config: AppConfig = loadConfig();
