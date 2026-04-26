import { describe, expect, test } from "bun:test";
import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  rootCapabilityExport
} from "../src/capability-snapshot.ts";
import { EVOLVE_CAPABILITY_DESCRIPTOR_VERSION, evolveCapabilityExport } from "../src/evolve/index.ts";
import { repositoryCapabilitySnapshot } from "../src/index.ts";

describe("repository root capability export", () => {
  test("exposes a versioned immutable boundary object", () => {
    expect(rootCapabilityExport).toBe(capabilitySnapshot);
    expect(repositoryCapabilitySnapshot).toBe(capabilitySnapshot);
    expect(rootCapabilityExport).toMatchObject({
      version: CAPABILITY_SNAPSHOT_VERSION,
      readOnly: true,
      evolve: evolveCapabilityExport
    });
    expect(rootCapabilityExport.version).toBe(CAPABILITY_SNAPSHOT_VERSION);
    expect(evolveCapabilityExport.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(Object.isFrozen(rootCapabilityExport)).toBe(true);
    expect(Object.isFrozen(rootCapabilityExport.evolve)).toBe(true);
    expect(Object.isFrozen(rootCapabilityExport.validation)).toBe(true);
    expect(() => {
      (rootCapabilityExport.evolve as { version: number }).version = 2;
    }).toThrow();
    expect(exportVersionedCapabilitySnapshot().capability).toBe(capabilitySnapshot);
  });
});
