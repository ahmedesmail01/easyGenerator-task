#!/usr/bin/env bash
set -euo pipefail
# Run once as the account that will deploy. Requires Docker + Compose already installed.
base=/opt/easygenerator
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
if [[ "${1:-}" == --host-nginx ]]; then
  mkdir -p "$base/shared"
  touch "$base/shared/host-nginx"
fi
command -v docker >/dev/null
docker compose version >/dev/null
umask 077
mkdir -p "$base/shared/secrets" "$base/shared/backups" "$base/releases" "$base/incoming"
chmod 700 "$base/shared" "$base/shared/secrets" "$base/shared/backups"
if [[ ! -f "$base/shared/.env" ]]; then
  cp "$source_dir/.env.example" "$base/shared/.env"
fi
for name in mongo_root_password mongo_app_password; do
  if [[ ! -s "$base/shared/secrets/$name" ]]; then
    openssl rand -hex 32 > "$base/shared/secrets/$name"
  fi
  # Compose mounts these into non-root containers. The parent is owner-only.
  chmod 444 "$base/shared/secrets/$name"
done
cp "$source_dir/mongo/init.js" "$base/shared/mongo-init.js"
cp "$source_dir/mongo/healthcheck.js" "$base/shared/mongo-healthcheck.js"
chmod 444 "$base/shared/mongo-init.js" "$base/shared/mongo-healthcheck.js"
printf '%s\n' 'Deployment storage prepared. Verify DOMAIN in /opt/easygenerator/shared/.env before deploying.'
