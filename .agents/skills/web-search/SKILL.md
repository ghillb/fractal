---
name: web-search
description: Structured web search via Perplexity API for agent research tasks.
---

# Web Search Skill

Use `.agents/skills/web-search/scripts/perplexity.ts` for direct Perplexity-backed search.

## Requirements

- `PERPLEXITY_API_KEY` must be set.

## Example

```bash
PERPLEXITY_API_KEY=... bun run .agents/skills/web-search/scripts/perplexity.ts "latest bun release notes"
```

## Error Handling

- Missing key: exits with actionable error.
- API failure: prints status/body and exits non-zero.
- Non-JSON answer: falls back to citation URLs + short snippet.
