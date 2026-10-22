#!/usr/bin/env bash
set -euo pipefail
sha=${1:?Usage: release.sh <40-character commit SHA>}
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || { echo 'Invalid release SHA' >&2; exit 1; }
base=/opt/easygenerator
release="$base/releases/$sha"
shared="$base/shared"
[[ -f "$shared/.env" && -s "$shared/secrets/mongo_app_password" ]] || { echo 'Run deploy/init.sh first' >&2; exit 1; }
exec 9>"$shared/deploy.lock"
flock 9
previous=$(readlink -f "$base/current" 2>/dev/null || true)
compose() {
  local tag="$1" directory="$2"
  shift 2
  local args=(--env-file "$shared/.env" -f "$directory/deploy/compose.yml")
  if [[ -f "$shared/host-nginx" ]]; then args+=(-f "$directory/deploy/compose.nginx.yml"); fi
  IMAGE_TAG="$tag" docker compose "${args[@]}" "$@"
}
rollback() {
  status=$?
  if [[ $status -ne 0 && -n "$previous" && -f "$previous/deploy/compose.yml" ]]; then
    echo 'Release failed; restoring previous application containers.' >&2
    old_sha=$(basename "$previous")
    compose "$old_sha" "$previous" up -d --wait --wait-timeout 180 || true
  fi
  exit "$status"
}
trap rollback EXIT
# Avoid printing secrets; the bundle contains images and deployment files only.
docker load --input "$release/images.tar.gz" >/dev/null
compose "$sha" "$release" config --quiet
compose "$sha" "$release" up -d --wait --wait-timeout 240
# Validate the public reverse proxy and TLS, not just container startup.
domain=$(sed -n 's/^DOMAIN=//p' "$shared/.env" | tail -1)
[[ "$domain" =~ ^[a-zA-Z0-9.-]+$ ]] || { echo 'Invalid DOMAIN' >&2; exit 1; }
healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 10 "https://$domain/api/health" >/dev/null 2>&1; then healthy=true; break; fi
  sleep 2
done
[[ "$healthy" == true ]] || { echo 'Public HTTPS health check failed; check DNS and Caddy logs.' >&2; exit 1; }
ln -sfn "$release" "$base/current"
# Loaded images remain available for rollback; discard duplicate transfer archives.
rm -f "$release/images.tar.gz" "$base/incoming/$sha.tgz"
trap - EXIT
echo "Released $sha at https://$domain"
