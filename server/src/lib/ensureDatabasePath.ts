import { mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';

const DEFAULT_DATABASE_URL = 'file:./dev.db';

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

/** Prisma resolves SQLite paths relative to the schema directory (server/prisma/). */
export function resolveSqliteFilePath(url?: string): string | null {
  const dbUrl = url ?? getDatabaseUrl();
  if (!dbUrl.startsWith('file:')) {
    return null;
  }
  let filePath = dbUrl.slice('file:'.length);
  if (filePath.startsWith('//')) {
    filePath = filePath.slice(1);
  }
  if (isAbsolute(filePath)) {
    return filePath;
  }
  const schemaDir = join(process.cwd(), 'prisma');
  return join(schemaDir, filePath.replace(/^\.\//, ''));
}

/** Ensure SQLite parent directory exists before migrate/start (required for file:/var/data/prod.db). */
export async function ensureDatabasePath(): Promise<string> {
  const url = getDatabaseUrl();
  const resolved = resolveSqliteFilePath(url);
  if (!resolved) {
    return url;
  }
  await mkdir(dirname(resolved), { recursive: true });
  return url;
}
