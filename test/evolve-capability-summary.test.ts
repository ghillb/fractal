import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilitySummary,
  getEvolveCapabilityDescriptor
} from "../src/evolve/index.ts";

describe("evolve capability summary", () => {
  test("exports a versioned read-only compatibility wrapper with a stable shape", () => {
    const descriptor = getEvolveCapabilityDescriptor();

    expect(evolveCapabilitySummary.version).toBe(EVOLVE_CAPABILITY_DESCRIPTOR_VERSION);
    expect(evolveCapabilitySummary.descriptor).toEqual(EVOLVE_CAPABILITY_DESCRIPTOR);
    expect(evolveCapabilitySummary.getDescriptor()).toEqual(descriptor);
    expect(evolveCapabilitySummary.getVersionedDescriptor()).toEqual(descriptor);
    expect(typeof evolveCapabilitySummary.read).toBe("function");
    expect(EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT).toBe(
      '{"version":1,"source":"persisted-evolve-journal","readOnly":true,"machineReadable":{"entryLimit":5,"summaryFormat":"machine-readable"}}'
    );
    expect(Object.isFrozen(descriptor)).toBe(true);
    expect(Object.isFrozen(descriptor.machineReadable)).toBe(true);
    expect(() => {
      (descriptor as { version: number }).version = 2;
    }).toThrow();
  });
});
