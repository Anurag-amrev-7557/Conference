#!/usr/bin/env bash
# Upload bare SPA route keys to S3 (GET /blog without trailing slash).
set -euo pipefail

BUCKET="${1:?S3 bucket name required}"
INDEX="${2:-dist/index.html}"

if [[ ! -f "$INDEX" ]]; then
  echo "upload-spa-routes: missing $INDEX" >&2
  exit 1
fi

ROUTES=(
  home
  register
  events
  blog
  dashboard
  admin
)

for route in "${ROUTES[@]}"; do
  aws s3 cp "$INDEX" "s3://${BUCKET}/${route}" \
    --content-type "text/html" \
    --cache-control "no-cache, no-store, must-revalidate"
done

echo "upload-spa-routes: uploaded ${#ROUTES[@]} bare route objects to s3://${BUCKET}/"
