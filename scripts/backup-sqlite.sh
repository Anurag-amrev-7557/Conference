#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/backups}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
BACKUP_FILE="$OUTPUT_DIR/sqlite-backup-$TIMESTAMP.db"

mkdir -p "$OUTPUT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required" >&2
  exit 1
fi

cd "$ROOT_DIR"

if ! docker compose ps --status running server >/dev/null 2>&1; then
  echo "server service is not running. Start the stack with: docker compose up -d" >&2
  exit 1
fi

docker compose cp server:/app/prisma/dev.db "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"