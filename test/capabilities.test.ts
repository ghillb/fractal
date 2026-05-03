import { describe, expect, test } from "bun:test";
import {
  CAPABILITIES_VERSION,
  exportCapabilityCapability,
  getVersionedCapabilityCapability
} from "../src/capabilities.ts";
import {
  CAPABILITIES_VERSION as CAPABILITIES_VERSION_FROM_ROOT,
  exportCapabilityCapability as exportCapabilityCapabilityFromRoot,
  getVersionedCapabilityCapability as getVersionedCapabilityCapabilityFromRoot
} from "../src/index.ts";

describe("capability capability facade", () => {
  test("exposes a versioned immutable derived field with stable public shape", () => {
    const versioned = getVersionedCapabilityCapability();
    const rootVersioned = getVersionedCapabilityCapabilityFromRoot();
    const capability = exportCapabilityCapability();

    expect(CAPABILITIES_VERSION_FROM_ROOT).toBe(CAPABILITIES_VERSION);
    expect(versioned.version).toBe(CAPABILITIES_VERSION);
    expect(rootVersioned.version).toBe(CAPABILITIES_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(rootVersioned.readOnly).toBe(true);
    expect(versioned.capability).toBe(capability);
    expect(rootVersioned.capability).toBe(capability);
    expect(exportCapabilityCapabilityFromRoot()).toBe(capability);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.capability)).toBe(true);
    expect(Object.isFrozen(versioned.capability.fields)).toBe(true);
    expect(versioned.capability).toEqual({
      version: CAPABILITIES_VERSION,
      readOnly: true,
      derived: true,
      capability: {
        version: CAPABILITIES_VERSION,
        label: "capabilities",
        stable: true
      },
      fields: expect.any(Array)
    });
    expect(versioned.capability.fields.map((field) => field.name)).toEqual([
      "version",
      "readOnly",
      "derived",
      "capability",
      "fields"
    ]);
    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      ((versioned.capability as unknown) as { capability: { label: string } }).capability.label = "mutated";
    }).toThrow();
  });
});
