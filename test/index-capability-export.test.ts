import { describe, expect, test } from "bun:test";
import {
  CAPABILITY_SNAPSHOT_VERSION,
  exportCapabilityDiscovery,
  getVersionedCapabilityDiscovery,
  rootCapabilityExport
} from "../src/index.ts";

describe("repository root capability export", () => {
  test("exposes a versioned immutable boundary object", () => {
    const discovery = getVersionedCapabilityDiscovery();

    expect(discovery.version).toBe(CAPABILITY_SNAPSHOT_VERSION);
    expect(discovery.readOnly).toBe(true);
    expect(discovery.capability).toBe(rootCapabilityExport);
    expect(exportCapabilityDiscovery()).toBe(rootCapabilityExport);
    expect(Object.isFrozen(discovery)).toBe(true);
    expect(Object.isFrozen(discovery.capability)).toBe(true);
    expect(Object.isFrozen(discovery.capability.validation)).toBe(true);
    expect(() => {
      (discovery as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (discovery.capability as { version: number }).version = 2;
    }).toThrow();
  });
});
