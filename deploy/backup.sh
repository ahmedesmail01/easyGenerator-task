#!/usr/bin/env bash
set -euo pipefail
base=/opt/easygenerator
shared="$base/shared"
release=$(readlink -f "$base/current")
sha=$(basename "$release")
umask 077
mkdir -p "$shared/backups"
file="$shared/backups/easygenerator-$(date -u +%Y%m%dT%H%M%SZ).archive.gz"
IMAGE_TAG="$sha" docker compose --env-file "$shared/.env" -f "$release/deploy/compose.yml" exec -T mongo sh -ec '
  config=$(mktemp)
  trap '''rm -f "$config"''' EXIT
  chmod 600 "$config"
  printf '''password: "%s"\n''' "$(cat /run/secrets/mongo_root_password)" > "$config"
  mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --authenticationDatabase admin --config "$config" --db easygenerator --archive --gzip
' > "$file.partial"
mv "$file.partial" "$file"
# Delete only this application's completed archives older than 14 days.
find "$shared/backups" -maxdepth 1 -type f -name 'easygenerator-*.archive.gz' -mtime +14 -delete
printf 'Created %s\n' "$file"
