import { copyFile, mkdir, readdir, stat, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { getDatabaseUrl, resolveSqliteFilePath } from './ensureDatabasePath';

export type BackupResult = {
  backupPath: string;
  pruned: number;
};

/** Copy SQLite DB to UPLOAD_ROOT/backups/ (or ./backups). Keeps last N backups. */
export async function backupDatabase(options?: {
  backupRoot?: string;
  keep?: number;
}): Promise<BackupResult | null> {
  const dbPath = resolveSqliteFilePath(getDatabaseUrl());
  if (!dbPath) {
    return null;
  }

  const uploadRoot = process.env.UPLOAD_ROOT?.trim();
  const backupDir =
    options?.backupRoot ??
    (uploadRoot ? join(uploadRoot, 'backups') : join(process.cwd(), 'backups'));
  const keep = options?.keep ?? 14;

  await mkdir(backupDir, { recursive: true });
  await mkdir(dirname(dbPath), { recursive: true }).catch(() => undefined);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(backupDir, `site-${stamp}.db`);
  await copyFile(dbPath, backupPath);

  const files = (await readdir(backupDir))
    .filter((name) => name.startsWith('site-') && name.endsWith('.db'))
    .sort()
    .reverse();

  let pruned = 0;
  for (const file of files.slice(keep)) {
    await unlink(join(backupDir, file));
    pruned += 1;
  }

  return { backupPath, pruned };
}

export async function getDatabaseStats(): Promise<{ ok: boolean; sizeBytes?: number }> {
  const dbPath = resolveSqliteFilePath(getDatabaseUrl());
  if (!dbPath) {
    return { ok: true };
  }
  try {
    const info = await stat(dbPath);
    return { ok: true, sizeBytes: info.size };
  } catch {
    return { ok: false };
  }
}
