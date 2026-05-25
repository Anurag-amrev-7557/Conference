#!/usr/bin/env bash
set -euo pipefail

FORCE=false

if [[ ${1:-} == "--force" ]]; then
  FORCE=true
  shift
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 [--force] <path-to-backup-db>" >&2
  exit 1
fi

BACKUP_PATH="$1"
if [[ ! -f "$BACKUP_PATH" ]]; then
  echo "Backup file not found: $BACKUP_PATH" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

cd "$ROOT_DIR"

if [[ "$FORCE" != "true" ]]; then
  echo "This will overwrite the live sqlite database in the server container."
  read -r -p "Type 'yes' to continue: " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo "Restore aborted."
    exit 1
  fi
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
PRE_RESTORE_DIR="${ROOT_DIR}/backups"
PRE_RESTORE_PATH="${PRE_RESTORE_DIR}/pre-restore-${STAMP}.db"

mkdir -p "$PRE_RESTORE_DIR"

docker compose up -d server
docker compose stop server
docker compose cp server:/app/prisma/dev.db "$PRE_RESTORE_PATH"
docker compose cp "$BACKUP_PATH" server:/app/prisma/dev.db
docker compose start server

echo "Pre-restore backup saved to: $PRE_RESTORE_PATH"
echo "Restore completed from: $BACKUP_PATH"