import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '@config/env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/** Folder where authenticated browser storage states are persisted (git-ignored). */
export const AUTH_DIR = path.join(PROJECT_ROOT, '.auth');

/**
 * Storage state file for the default test user – scoped per environment so switching
 * `TEST_ENV` never reuses a session from a different backend.
 */
export const DEFAULT_USER_STATE = path.join(AUTH_DIR, `${config.name}.user.json`);

/** Metadata about the API-created user (email/password) that owns DEFAULT_USER_STATE. */
export const DEFAULT_USER_META = path.join(AUTH_DIR, `${config.name}.user.meta.json`);
