import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  getEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary
} from "../src/evolve/capability-summary.ts";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("evolve capability summary", () => {
  test("keeps the versioned descriptor stable and read-only across a journal round trip", async () => {
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

    const descriptor = getEvolveCapabilityDescriptor();
    const summary = await readEvolveCapabilitySummary(2, journalPath);
    const exportedDescriptor = summary.descriptor;

    expect(descriptor).toEqual(EVOLVE_CAPABILITY_DESCRIPTOR);
    expect(descriptor.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(Object.isFrozen(descriptor)).toBe(true);
    expect(Object.isFrozen(EVOLVE_CAPABILITY_DESCRIPTOR)).toBe(true);
    expect(Object.isFrozen(exportedDescriptor)).toBe(true);
    expect(() => {
      (descriptor as { version: number }).version = 2;
    }).toThrow();
    expect(exportedDescriptor).toEqual(EVOLVE_CAPABILITY_DESCRIPTOR);
    expect(exportedDescriptor.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(summary).toEqual({
      descriptor: EVOLVE_CAPABILITY_DESCRIPTOR,
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
