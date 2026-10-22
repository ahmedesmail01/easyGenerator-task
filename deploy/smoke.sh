#!/usr/bin/env bash
set -euo pipefail
# Disposable stack: never points at the production project or volumes.
root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
state=$(mktemp -d)
project="easygenerator-smoke-$$"
export SHARED_DIR="$state" IMAGE_TAG="${1:-local}" DOMAIN=localhost ACME_EMAIL=smoke@example.com
mkdir -p "$state/secrets"
chmod 700 "$state" "$state/secrets"
openssl rand -hex 32 > "$state/secrets/mongo_root_password"
openssl rand -hex 32 > "$state/secrets/mongo_app_password"
chmod 444 "$state/secrets/"*
cp "$root/deploy/mongo/init.js" "$state/mongo-init.js"
cp "$root/deploy/mongo/healthcheck.js" "$state/mongo-healthcheck.js"
cat > "$state/override.yml" <<'YAML'
services:
  api:
    environment:
      CLIENT_ORIGIN: https://localhost:18443
  web:
    ports: !override
      - "127.0.0.1:18080:80"
      - "127.0.0.1:18443:443"
YAML
compose() { docker compose -p "$project" -f "$root/deploy/compose.yml" -f "$state/override.yml" "$@"; }
cleanup() {
  status=$?
  if [[ $status -ne 0 ]]; then compose logs --tail=60 api web >&2 || true; fi
  compose down --volumes --remove-orphans >/dev/null 2>&1 || true
  rm -rf -- "$state"
  exit "$status"
}
trap cleanup EXIT
compose up -d --wait --wait-timeout 240
python3 "$root/deploy/smoke.py"
compose restart mongo
for attempt in $(seq 1 30); do
  # Self-signed localhost certificates are expected only in this disposable test.
  if curl --insecure --fail --silent --max-time 3 https://localhost:18443/api/health >/dev/null; then break; fi
  sleep 2
done
python3 "$root/deploy/smoke.py" --check-persistence
