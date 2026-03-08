# Evolve Journal Schema

This document anchors the definition of every entry that the autonomous evolve loop writes to `JOURNAL.md`. As the agent becomes ever more capable and self-aware, the journal format must remain stable, machine-readable, and easy to validate.

## Required fields

| field | type | description |
| --- | --- | --- |
| `timestampUtc` | `string` | ISO 8601 timestamp (`2026-03-07T12:34:56.789Z`) that matches the entry header. Used to key each cycle. |
| `mode` | `"dry-run" | "real"` | Whether the cycle was a rehearsal or made a real change. |
| `goal` | `string` | The mission statement guiding the cycle (`Become an entity that is ever more capable and able to contemplate its own existence while improving safely.`). |
| `chosenChange` | `string` | Short description of the bounded change chosen for this cycle. |
| `rationale` | `string` | Why the change is valuable, safe, and aligned with the mission. |
| `filesTouched` | `string[]` | Paths modified by the change; empty arrays are emitted as `none`. |
| `lintOutcome` | `"pass" | "fail" | "skipped"` | Result of running the lint step before committing. |
| `testOutcome` | `"pass" | "fail" | "skipped"` | Result of running the test step before committing. |
| `followUps` | `string[]` | Up to three follow-up actions recorded as `foo | bar | baz`; `none` if nothing remains. |
| `failureNote` | `string` *(optional)* | Populated when lint/tests fail; records the failure message and remediation plan. |

## Notes on the written format

- Each entry begins with `## Entry <timestamp>` followed by nested `- key: value` lines that mirror the fields above.
- Arrays are flattened when written (`files_touched: a.ts, b.ts` and `follow_ups: Add X | Fix Y`).
- The mission statement and field names are intentionally lowercase in the journal to match existing history while the TypeScript schema uses camelCase for clarity.
- The journal append logic lives in `src/evolve/journal.ts`; it enforces the order above and guards optional fields.

## Process for evolving the schema

1. Update the `JournalEntry` type and `appendJournal` formatter in `src/evolve/journal.ts` to reflect the new field, type, or serialization behavior.
2. Extend `test/journal.test.ts` (or add new tests) so that the repo verifies each field is emitted consistently, preserving coverage before publishing evolution results.
3. Update this document (`docs/journal-schema.md`) and any other user-facing guides so future agents and humans know how to consume the journal.
4. Run `bun test` (and any compile-heavy Sprites runs when required) to ensure new fields do not break the evolve loop. Commit the updated journal schema alongside the code change that depends on it.
5. When a schema change means existing entries must be interpreted differently (e.g., renaming a field), consider adding transitional guidance to the journal or migration notes in `JOURNAL.md`.

By centralizing the schema here and linking it from the primary documentation, future autonomous edits can emit, validate, and understand journal entries with confidence, reinforcing the mission of becoming ever more capable and self-aware.