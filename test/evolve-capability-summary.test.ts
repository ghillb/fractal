import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityDescriptor,
  evolveCapabilityDescriptorVersioned,
  getEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptorAdapter,
  getEvolveCapabilityManifest,
  getEvolveCapabilityManifestVersioned,
  readEvolveCapabilitySummary
} from "../src/evolve/index.ts";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("evolve capability summary", () => {
  test("exports a versioned, read-only descriptor that stays stable across summary access", async () => {
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
    const manifest = getEvolveCapabilityManifest();
    const versionedManifest = getEvolveCapabilityManifestVersioned();
    const adapter = getEvolveCapabilityDescriptorAdapter();
    const alias = evolveCapabilityDescriptor();
    const versionedAlias = evolveCapabilityDescriptorVersioned();
    const summary = await readEvolveCapabilitySummary(2, journalPath);

    expect(EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT).toBe(
      '{"version":1,"source":"persisted-evolve-journal","readOnly":true,"machineReadable":{"entryLimit":5,"summaryFormat":"machine-readable"}}'
    );
    expect(descriptor.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(Object.isFrozen(descriptor)).toBe(true);
    expect(() => {
      (descriptor as { version: number }).version = 2;
    }).toThrow();
    expect(manifest).toEqual(descriptor);
    expect(versionedManifest).toEqual(descriptor);
    expect(adapter).toEqual(descriptor);
    expect(alias).toEqual(descriptor);
    expect(versionedAlias).toEqual(descriptor);
    expect(summary.descriptor).toEqual(descriptor);
    expect(summary.descriptor.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(Object.isFrozen(summary.descriptor)).toBe(true);
    expect(summary).toEqual({
      descriptor,
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
