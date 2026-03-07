---
name: dialectic
description: >
  Structured Electric Monks dialectic workflow for deep contradiction analysis
  and synthesis. Use when the user wants to stress-test a thesis, resolve a
  genuine tension, or build a higher-order model in high-stakes decisions;
  avoid for factual lookups or low-stakes questions.
---

# Dialectic (Electric Monks)

Run a 2-monk dialectic loop to reach non-compromise synthesis (Aufhebung).

## Progressive Disclosure

- If user asks for deep method details, load `references/background.md` if present.

## Storage Policy

- Default working storage: `~/.cada/dialectics/<topic>/`
- Optional durable publish path when explicitly requested:
  `~/code/qimatic/memory/cada/dialectics/<topic>-YYYY-MM-DD.md`

## Initialize Topic Workspace

```bash
python3 .agents/skills/dialectic/scripts/init_dialectic.py "<topic>"
```

Creates:
- `context_briefing.md`
- `monk_a_output.md`
- `monk_b_output.md`
- `determinate_negation.md`
- `sublation.md`
- `dialectic_queue.md`
- `index.md`

## Execution Loop

1. Explain process + set expectations.
2. Run elenctic interview for assumptions.
3. Fill `context_briefing.md`.
4. Spawn Monk A and Monk B in isolation.
5. Save monk outputs + determinate negation.
6. Produce synthesis in `sublation.md` (cancel/preserve/elevate).
7. Validate with both monks + hostile auditor pass.
8. Add 2-4 next contradictions to `dialectic_queue.md`.

## Quality Rules

- Prefer strongest available model for orchestrator + monk runs.
- Keep monk prompts parallel for comparability.
- Record explicit model update: Before -> After -> Because.
- Stop dialectic mode when problem becomes mostly factual.
