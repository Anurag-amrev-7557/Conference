#!/usr/bin/env npx ts-node
/**
 * Manual / cron backup for CMS SQLite database.
 * Example cron (daily 3am): 0 3 * * * cd /app && npm run backup:db
 */
import dotenv from 'dotenv';
import { backupDatabase } from '../src/lib/backupDatabase';

dotenv.config();

async function main() {
  const result = await backupDatabase();
  if (!result) {
    console.log('Backup skipped — DATABASE_URL is not a local SQLite file.');
    process.exit(0);
  }
  console.log(`Backup saved: ${result.backupPath} (pruned ${result.pruned} old file(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
