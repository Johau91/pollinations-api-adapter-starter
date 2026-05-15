import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadEnv(path = '.env') {
  const fullPath = resolve(process.cwd(), path);
  if (!existsSync(fullPath)) return;

  const lines = readFileSync(fullPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
