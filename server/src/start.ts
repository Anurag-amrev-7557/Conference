import dotenv from 'dotenv';
import path from 'node:path';

const envDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(envDir, '.env') });
if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: path.join(envDir, '.env.development'), override: true });
}

process.on('uncaughtException', (err) => {
  console.error('[bootstrap] uncaughtException:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[bootstrap] unhandledRejection:', reason);
});

void import('./index').catch((err) => {
  console.error('[bootstrap] Failed to import server entry:', err);
  process.exit(1);
});
