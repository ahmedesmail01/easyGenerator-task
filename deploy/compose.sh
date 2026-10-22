#!/usr/bin/env bash
set -euo pipefail
base=/opt/easygenerator
release=$(readlink -f "$base/current")
export IMAGE_TAG=$(basename "$release")
args=(--env-file "$base/shared/.env" -f "$release/deploy/compose.yml")
if [[ -f "$base/shared/host-nginx" ]]; then args+=(-f "$release/deploy/compose.nginx.yml"); fi
exec docker compose "${args[@]}" "$@"
