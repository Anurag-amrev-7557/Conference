import dotenv from 'dotenv';

dotenv.config();

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
