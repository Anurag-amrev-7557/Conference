#!/bin/sh
set -e

if command -v npx >/dev/null 2>&1; then
  node -e "require('./dist/lib/ensureDatabasePath').ensureDatabasePath().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); })"
  npx prisma migrate deploy
fi

exec node dist/index.js
