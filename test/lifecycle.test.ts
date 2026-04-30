import { describe, expect, test } from "bun:test";
import { getLifecycleInspection, LIFECYCLE_VERSION } from "../src/lifecycle.ts";

describe("lifecycle inspection adapter", () => {
  test("exposes a versioned immutable status object", () => {
    const inspection = getLifecycleInspection();

    expect(inspection.version).toBe(LIFECYCLE_VERSION);
    expect(inspection.readOnly).toBe(true);
    expect(inspection.domain).toBe("lifecycle");
    expect(Object.isFrozen(inspection)).toBe(true);
    expect(Object.isFrozen(inspection.status)).toBe(true);
    expect(() => {
      (inspection as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (inspection.status as { phase: string }).phase = "boot";
    }).toThrow();
  });
});
