import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readEvolveCapabilitySummary } from "../src/evolve/capability-summary.ts";

describe("evolve capability summary", () => {
  test("summarizes persisted journal capabilities in a compact downstream-friendly shape", async () => {
    const temp = mkdtempSync(join(tmpdir(), "fractal-capability-summary-"));
    const journalPath = join(temp, "JOURNAL.md");
    writeFileSync(
      journalPath,
      [
        "# JOURNAL",
        "",
        "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-12T00:00:00.000Z\",\"chosenChange\":\"newer\",\"rationale\":\"newer rationale\",\"outcome\":\"reverted\",\"targetFiles\":[\"src/evolve/observe.ts\",\"src/evolve/types.ts\"],\"blockingReason\":\"needs narrowing\",\"nextCyclePlan\":[\"step c\"]} -->",
        "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-11T00:00:00.000Z\",\"chosenChange\":\"older\",\"rationale\":\"older rationale\",\"outcome\":\"planned\",\"targetFiles\":[\"src/evolve/journal.ts\"],\"nextCyclePlan\":[\"step a\"]} -->"
      ].join("\n"),
      "utf8"
    );

    await expect(readEvolveCapabilitySummary(2, journalPath)).resolves.toEqual({
      source: "persisted-evolve-journal",
      entryCount: 2,
      latestTimestampUtc: "2026-03-11T00:00:00.000Z",
      latestOutcome: "planned",
      latestTargetFiles: ["src/evolve/journal.ts"],
      capabilityNames: [
        "outcome:planned",
        "outcome:reverted",
        "persisted-evolve-journal",
        "target:src/evolve/journal.ts",
        "target:src/evolve/observe.ts",
        "target:src/evolve/types.ts"
      ]
    });
  });
});
