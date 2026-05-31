import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';

const DEFAULT_DATABASE_URL = 'file:./prisma/dev.db';

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

/** Ensure SQLite parent directory exists before migrate/start (required for file:/var/data/prod.db). */
export async function ensureDatabasePath(): Promise<string> {
  const url = getDatabaseUrl();
  if (!url.startsWith('file:')) {
    return url;
  }

  let filePath = url.slice('file:'.length);
  if (filePath.startsWith('//')) {
    filePath = filePath.slice(1);
  }

  const resolved = isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);
  await mkdir(dirname(resolved), { recursive: true });
  return url;
}
