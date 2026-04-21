import { describe, expect, test } from "bun:test";
import { evolveCapabilityRegistry, readEvolveCapabilityRegistry } from "../src/evolve/capability-registry.ts";
import { evolveCapabilityExport } from "../src/evolve/index.ts";

describe("evolve capability registry", () => {
  test("exports a versioned immutable composition of summary and journal snapshots", async () => {
    const registry = await readEvolveCapabilityRegistry(undefined, "./does-not-exist-journal.md");

    expect(registry.version).toBe(1);
    expect(registry.readOnly).toBe(true);
    expect(registry.source).toBe("persisted-evolve-journal");
    expect(registry.machineReadable.summary.descriptor.readOnly).toBe(true);
    expect(registry.machineReadable.journal.readOnly).toBe(true);
    expect(registry.machineReadable.capabilityNames).toEqual([
      "evolve-capability-registry",
      "persisted-evolve-journal",
      "repository-introspection"
    ]);

    expect(Object.isFrozen(registry)).toBe(true);
    expect(Object.isFrozen(registry.machineReadable)).toBe(true);
    expect(Object.isFrozen(registry.machineReadable.capabilityNames)).toBe(true);
    expect(Object.isFrozen(registry.machineReadable.summary.latestTargetFiles)).toBe(true);
    expect(Object.isFrozen(registry.machineReadable.journal.machineReadable.latestTargetFiles)).toBe(true);

    expect(registry.machineReadable.capabilityNames.includes("mutated")).toBe(false);
  });

  test("is re-exported through the evolve index export surface", () => {
    expect(evolveCapabilityExport.registry).toBe(evolveCapabilityRegistry);
  });
});
