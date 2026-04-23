import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport
} from "../src/index.ts";

describe("repository root capability export", () => {
  test("exposes an immutable versioned boundary object", () => {
    expect(evolveCapabilityExport).toMatchObject({
      version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
      readOnly: true,
      export: EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT
    });
    expect(Object.isFrozen(evolveCapabilityExport)).toBe(true);
    expect(typeof evolveCapabilityExport.getDescriptor).toBe("function");
    expect(evolveCapabilityExport.summary.read).toBeTypeOf("function");
    expect(evolveCapabilityExport.registry.read).toBeTypeOf("function");
  });
});
