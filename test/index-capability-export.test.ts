import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport,
  rootCapabilityExport
} from "../src/index.ts";

describe("repository root capability export", () => {
  test("exposes an immutable versioned boundary object", () => {
    expect(rootCapabilityExport).toMatchObject({
      version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
      readOnly: true,
      evolve: evolveCapabilityExport
    });
    expect(Object.isFrozen(rootCapabilityExport)).toBe(true);
    expect(Object.isFrozen(rootCapabilityExport.evolve)).toBe(true);
    expect(typeof rootCapabilityExport.evolve.getDescriptor).toBe("function");
    expect(rootCapabilityExport.evolve.summary.read).toBeTypeOf("function");
    expect(rootCapabilityExport.evolve.registry.read).toBeTypeOf("function");
  });
});
