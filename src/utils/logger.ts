import { config } from '@config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/**
 * Minimal structured logger. Kept dependency-free on purpose: every worker process
 * imports it, so start-up cost matters. Output is one line per message, prefixed with
 * an ISO timestamp, the level and an optional scope – easy to grep in CI logs.
 */
export class Logger {
  constructor(private readonly scope: string) {}

  private write(level: Level, message: string, meta?: unknown): void {
    if (ORDER[level] < ORDER[config.logLevel]) return;
    const ts = new Date().toISOString();
    const extra = meta === undefined ? '' : ` ${safeStringify(meta)}`;
    const line = `${ts} [${level.toUpperCase()}] [${this.scope}] ${message}${extra}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }

  debug(message: string, meta?: unknown): void {
    this.write('debug', message, meta);
  }
  info(message: string, meta?: unknown): void {
    this.write('info', message, meta);
  }
  warn(message: string, meta?: unknown): void {
    this.write('warn', message, meta);
  }
  error(message: string, meta?: unknown): void {
    this.write('error', message, meta);
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, redactSecrets);
  } catch {
    return String(value);
  }
}

const SECRET_KEYS = /pass(word)?|token|secret|authorization/i;
function redactSecrets(key: string, value: unknown): unknown {
  return SECRET_KEYS.test(key) && typeof value === 'string' ? '***' : value;
}

export const createLogger = (scope: string): Logger => new Logger(scope);
