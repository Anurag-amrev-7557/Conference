/**
 * Render builds still use `prisma db push` in many dashboards. Drop orphaned legacy
 * tables before db push so Prisma does not block on data-loss warnings.
 */
const { execSync } = require('child_process');
const path = require('path');

if (!process.env.RENDER) {
  process.exit(0);
}

const serverRoot = path.join(__dirname, '..');
const sql = 'DROP TABLE IF EXISTS "Member";';

try {
  console.log('[render-prepare-db] Dropping legacy Member table if present…');
  execSync('npx prisma db execute --stdin --schema prisma/schema.prisma', {
    cwd: serverRoot,
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log('[render-prepare-db] Legacy table cleanup complete.');
} catch (error) {
  console.warn('[render-prepare-db] Cleanup skipped or failed (non-fatal):', error.message);
}
