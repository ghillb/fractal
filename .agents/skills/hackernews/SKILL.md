---
name: hackernews
description: Search and browse Hacker News via Algolia API (front, trending, search, comments).
---

# Hacker News Skill

Use `.agents/skills/hackernews/scripts/hn.ts` for high-signal Hacker News story discovery.

## Commands

- `front`
  - `-n` number of results (default `20`)
- `trending`
  - `--hours` lookback window (default `24`)
  - `--min-points` minimum score (default `100`)
  - `-n` number of results (default `15`)
- `search "<query>"`
  - `--min-points` minimum points (default `0`)
  - `-n` number of results (default `10`)
- `comments <item_id>`
  - `-n` number of comments (default `20`)

## Examples

```bash
bun run .agents/skills/hackernews/scripts/hn.ts front
bun run .agents/skills/hackernews/scripts/hn.ts trending --hours 72 --min-points 200 -n 15
bun run .agents/skills/hackernews/scripts/hn.ts search "AI agents OR coding assistant" --min-points 50 -n 10
bun run .agents/skills/hackernews/scripts/hn.ts comments 47255881 -n 40
```

## Notes

- API: https://hn.algolia.com/api
- No API key required
- Output is JSON for agent parsing
