# fractal

Minimal Bun + TypeScript coding agent with an autonomous 8-hour self-evolution harness.

## What it does

- LLM-driven coding agent (`OpenAI`) with tool calling.
- OpenAI integration uses the Responses API (`/v1/responses`) for codex-compatible models.
- Tooling for URL fetch, Perplexity web search, Hacker News signals, workspace file ops, and Sprites remote build execution.
- Skill loader for `.agents/skills/**/SKILL.md`.
- Autonomous evolve cycle that:
  1. observes (issues, commits, journal, optional HN),
  2. orients,
  3. chooses one bounded high-impact change,
  4. implements + validates,
  5. commits if green,
  6. reverts if red,
  7. journals outcome.

Detailed schema for `JOURNAL.md` entries and the process for evolving it are recorded in [docs/journal-schema.md](docs/journal-schema.md) so future cycles can emit and validate entries consistently.

## Prerequisites

- Bun `>=1.3`
- Git + GitHub CLI (`gh`) authenticated
- OpenAI API key
- Optional: Perplexity API key
- Optional: Sprites CLI for compile-heavy remote runs

## Setup

```bash
bun install
```

Create env file (or export variables):

```bash
export OPENAI_API_KEY=...
export OPENAI_MODEL=gpt-5.1-codex-mini
export PERPLEXITY_API_KEY=...            # optional, enables web_search tool
export SPRITES_ENABLED=false             # set true to enable Sprites policy
export SPRITES_DEFAULT_NAME=qbuild
```

## Commands

```bash
# Run agent
bun run agent -- "test task: summarize repository architecture"

# Run evolve cycle (plan only)
bun run evolve:cycle --dry-run

# Run evolve cycle (real)
bun run evolve:cycle

# Lint / tests
bun run lint
bun test
```

## Sprites skill quickstart

```bash
# check CLI
sprite --help

# wrapper examples
.agents/skills/sprites/scripts/sprites.sh create qbuild
.agents/skills/sprites/scripts/sprites.sh exec qbuild "bash -lc 'uname -a'"
.agents/skills/sprites/scripts/sprites.sh api-get qbuild "/workspace/README.md"
.agents/skills/sprites/scripts/sprites.sh destroy qbuild

# ephemeral build workflow
.agents/skills/sprites/scripts/sprites.sh ephemeral qbuild "bun run lint && bun test"
```

If Sprites is unavailable and `SPRITES_ENABLED=true`, fractal fails safely with actionable setup errors.

## Skill system

Loaded from `.agents/skills/**/SKILL.md`:

- `hackernews`
- `web-search`
- `sprites`
- `dialectic`

## Evolve workflow (GitHub Actions)

- File: `.github/workflows/evolve.yml`
- Triggers:
  - `schedule`: every 8 hours (`0 */8 * * *`)
  - `workflow_dispatch`: manual run
- Permissions:
  - `contents: write`
  - `issues: write`
  - `pull-requests: write`
- Uses:
  - `OPENAI_API_KEY` (required)
  - `PERPLEXITY_API_KEY` (optional)
  - `SPRITE_TOKEN` (required only when `SPRITES_ENABLED=true`)

Workflow behavior:
- Runs `bun run evolve:cycle`.
- Persists `JOURNAL.md` even when evolve fails/reverts, then pushes if ahead.
- Fails workflow when evolve run reverts due to implementation error.
- Explicit `plan` outcomes remain non-error even when they produce no diff.
- High-uncertainty cases are recorded as planned handoffs, not a separate outcome.
- Implement runs that produce no diff still fail; only explicit planned handoffs are green.

## Enable Sprites in GitHub Actions

Set these repository settings:

```bash
# required when using sprites
gh secret set SPRITE_TOKEN --repo ghillb/fractal

# enable sprites policy in evolve
gh variable set SPRITES_ENABLED --body \"true\" --repo ghillb/fractal
gh variable set SPRITES_DEFAULT_NAME --body \"qbuild\" --repo ghillb/fractal
```

The workflow installs Sprite CLI, runs `sprite auth setup --token "$SPRITE_TOKEN"`, then enables compile-heavy remote checks.

## Example command output

```text
$ bun run agent -- "test task: summarize repository architecture"
fractal is organized into src/agent (LLM loop), src/tools (tool adapters), src/skills (SKILL loader), and src/evolve (autonomous cycle).
```

```text
$ bun run evolve:cycle --dry-run
{
  "mode": "dry-run",
  "goal": "Become an entity that is ever more capable while improving safely.",
  "decision": {
    "diagnosis": "...",
    "chosenChange": "...",
    "rationale": "...",
    "uncertainty": 0.32,
    "executionMode": "implement",
    "compileHeavy": false,
    "targetFiles": ["src/evolve/journal.ts"],
    "nextCyclePlan": [],
    "followUps": ["..."]
  }
}
```

## Example evolve cycle using Sprites

When `SPRITES_ENABLED=true` and change is compile-heavy, evolve enforces remote validation:

```text
- chosen_change: add Rust build check
- compile_heavy: true
- action: .agents/skills/sprites/scripts/sprites.sh ephemeral qbuild "bun run lint && bun test"
- result: pass -> commit evolve(agent): ...
```
