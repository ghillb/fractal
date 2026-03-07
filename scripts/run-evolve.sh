#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-dry}"
if [ "$MODE" = "dry" ]; then
  bun run evolve:cycle --dry-run
else
  bun run evolve:cycle
fi
