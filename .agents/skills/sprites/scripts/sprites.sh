#!/usr/bin/env bash
set -euo pipefail

TIMEOUT_SECONDS="${SPRITE_TIMEOUT_SECONDS:-120}"
RETRIES="${SPRITE_RETRIES:-2}"
CHECKPOINT="${SPRITE_CHECKPOINT:-false}"

run_retry() {
  local cmd="$1"
  local attempt=0
  while [ "$attempt" -le "$RETRIES" ]; do
    if timeout "${TIMEOUT_SECONDS}s" bash -lc "$cmd"; then
      return 0
    fi
    attempt=$((attempt + 1))
  done
  return 1
}

require_sprite() {
  if ! command -v sprite >/dev/null 2>&1; then
    echo "sprite CLI not found. Install from https://sprites.dev" >&2
    exit 2
  fi
}

sprite_create() {
  require_sprite
  run_retry "sprite create $1"
}

sprite_exec() {
  require_sprite
  local name="$1"
  shift
  run_retry "sprite exec -s ${name} -- $*"
}

sprite_api_get() {
  require_sprite
  local name="$1"
  local path="$2"
  run_retry "sprite api GET '/v1/sprites/${name}/fs/read?path=${path}'"
}

sprite_destroy() {
  if command -v sprite >/dev/null 2>&1; then
    run_retry "sprite destroy -s $1 --force" || true
  fi
}

sprite_ephemeral() {
  require_sprite
  local name="$1"
  local build_cmd="$2"
  local artifact_path="${3:-}"

  local checkpoint_ref=""
  if [ "$CHECKPOINT" = "true" ]; then
    checkpoint_ref="$(git rev-parse --verify HEAD 2>/dev/null || true)"
    echo "checkpoint=${checkpoint_ref}" >&2
  fi

  local tmp
  tmp="$(mktemp -d)"
  trap 'sprite_destroy "$name"; rm -rf "$tmp"' EXIT

  sprite_create "$name"
  tar --exclude=.git --exclude=node_modules -czf "$tmp/source.tgz" .
  timeout "${TIMEOUT_SECONDS}s" bash -lc "sprite exec -s ${name} -- bash -lc 'mkdir -p /workspace && cat > /workspace/source.tgz' < '$tmp/source.tgz'"
  sprite_exec "$name" "bash -lc 'cd /workspace && tar -xzf source.tgz && rm source.tgz && ${build_cmd}'"

  if [ -n "$artifact_path" ]; then
    sprite_api_get "$name" "$artifact_path"
  fi
}

cmd="${1:-}"
case "$cmd" in
  create)
    sprite_create "$2"
    ;;
  exec)
    sprite_exec "$2" "${@:3}"
    ;;
  api-get)
    sprite_api_get "$2" "$3"
    ;;
  destroy)
    sprite_destroy "$2"
    ;;
  ephemeral)
    sprite_ephemeral "$2" "$3" "${4:-}"
    ;;
  *)
    cat <<USAGE
Usage:
  sprites.sh create <name>
  sprites.sh exec <name> <command...>
  sprites.sh api-get <name> <path>
  sprites.sh destroy <name>
  sprites.sh ephemeral <name> <build_command> [artifact_path]
USAGE
    exit 1
    ;;
esac
