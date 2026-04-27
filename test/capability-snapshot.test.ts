import { describe, expect, test } from "bun:test";
import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  cliCapabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  rootCapabilityExport
} from "../src/capability-snapshot.ts";
import { validateMachineReadableBlock } from "../src/evolve/journal-validator.ts";

describe("capability snapshot", () => {
  test("exports a versioned immutable aggregate of read-only entrypoints and validation hooks", () => {
    expect(CAPABILITY_SNAPSHOT_VERSION).toBe(2);
    expect(capabilitySnapshot.version).toBe(CAPABILITY_SNAPSHOT_VERSION);
    expect(capabilitySnapshot.readOnly).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot)).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot.validation)).toBe(true);
    expect(capabilitySnapshot.validation.journalBlock).toBe(validateMachineReadableBlock);
    expect(cliCapabilitySnapshot).toBe(capabilitySnapshot);
    expect(rootCapabilityExport).toBe(capabilitySnapshot);
    const exported = exportVersionedCapabilitySnapshot();
    expect(exported.version).toBe(CAPABILITY_SNAPSHOT_VERSION);
    expect(exported.readOnly).toBe(true);
    expect(exported.capability).toBe(capabilitySnapshot);
    expect(Object.isFrozen(exported)).toBe(true);
    expect(exportCapabilitySnapshot()).toBe(capabilitySnapshot);
    expect(exportCapabilitySnapshot()).toBe(exportCapabilitySnapshot());

    expect(() => {
      (exported as { version: number }).version = 2;
    }).toThrow();
  });
});
