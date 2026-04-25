import { describe, expect, test } from "bun:test";
import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  cliCapabilitySnapshot,
  exportCapabilitySnapshot,
  rootCapabilityExport
} from "../src/capability-snapshot.ts";
import { validateMachineReadableBlock } from "../src/evolve/journal-validator.ts";

describe("capability snapshot", () => {
  test("exports a versioned immutable aggregate of read-only entrypoints and validation hooks", () => {
    expect(CAPABILITY_SNAPSHOT_VERSION).toBe(1);
    expect(capabilitySnapshot.version).toBe(CAPABILITY_SNAPSHOT_VERSION);
    expect(capabilitySnapshot.readOnly).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot)).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot.validation)).toBe(true);
    expect(capabilitySnapshot.validation.journalBlock).toBe(validateMachineReadableBlock);
    expect(cliCapabilitySnapshot).toBe(capabilitySnapshot);
    expect(rootCapabilityExport).toBe(capabilitySnapshot);
    expect(exportCapabilitySnapshot()).toBe(capabilitySnapshot);
    expect(exportCapabilitySnapshot()).toBe(exportCapabilitySnapshot());

    expect(() => {
      (capabilitySnapshot as { version: number }).version = 2;
    }).toThrow();
  });
});
