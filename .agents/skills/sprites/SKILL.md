---
name: sprites
description: Run compile-heavy workflows in remote ephemeral Sprite environments.
---

# Sprites Skill

Use `.agents/skills/sprites/scripts/sprites.sh` wrappers.

## Wrappers

- `sprite_create <name>`
- `sprite_exec <name> <command>`
- `sprite_api_get <name> <path>`
- `sprite_destroy <name>`
- `sprite_ephemeral <name> <build_command> [artifact_path]`

## Ephemeral Workflow

`create -> upload source tarball -> build/test -> optional artifact read -> destroy`.

## Safety

- Retries + timeouts on every `sprite` command.
- `destroy` in `finally` path.
- Optional checkpoint support (`SPRITE_CHECKPOINT=true`) before untrusted runs.

## Config

- `SPRITES_ENABLED=true|false`
- `SPRITES_DEFAULT_NAME=qbuild`

## Fallback

If `sprite` CLI is unavailable, return actionable setup guidance and fail safely.
