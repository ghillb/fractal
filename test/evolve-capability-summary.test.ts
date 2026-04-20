import { describe, expect, test } from "bun:test";
import {
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport
} from "../src/evolve/index";

describe("evolve capability export", () => {
  test("exports a version-tagged read-only wrapper", () => {
    expect(evolveCapabilityExport).toMatchObject({
      version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
      readOnly: true,
      export: EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT
    });
    expect(Object.isFrozen(evolveCapabilityExport)).toBe(true);
    expect(typeof evolveCapabilityExport.getDescriptor).toBe("function");
  });
});
