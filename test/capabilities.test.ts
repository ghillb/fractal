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
    expect(Object.isFrozen(versioned.capability.immutability)).toBe(true);
    expect(Object.isFrozen(versioned.capability.derivedSignature)).toBe(true);
    expect(versioned.capability).toEqual({
      version: CAPABILITIES_VERSION,
      readOnly: true,
      derived: true,
      capability: {
        version: CAPABILITIES_VERSION,
        label: "capabilities",
        stable: true
      },
      fields: expect.any(Array),
      immutability: {
        version: CAPABILITIES_VERSION,
        frozen: true,
        stableShape: true
      },
      derivedSignature: {
        version: CAPABILITIES_VERSION,
        value: "capabilities@4",
        derived: true
      }
    });
    expect(versioned.capability.fields.map((field) => field.name)).toEqual([
      "version",
      "readOnly",
      "derived",
      "capability",
      "fields",
      "immutability",
      "derivedSignature"
    ]);
    expect(versioned.capability.derivedSignature).toEqual({
      version: CAPABILITIES_VERSION,
      value: "capabilities@4",
      derived: true
    });
    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      ((versioned.capability as unknown) as { immutability: { frozen: boolean } }).immutability.frozen = false;
    }).toThrow();
  });
});
