import { describe, expect, test } from "bun:test";
import {
  LIFECYCLE_VERSION,
  getLifecycleInspection,
  getVersionedLifecycleInspection
} from "../src/lifecycle.ts";
import {
  LIFECYCLE_VERSION as LIFECYCLE_VERSION_FROM_ROOT,
  getLifecycleInspection as getLifecycleInspectionFromRoot,
  getVersionedLifecycleInspection as getVersionedLifecycleInspectionFromRoot
} from "../src/index.ts";

describe("lifecycle inspection adapter", () => {
  test("exposes a versioned immutable status object", () => {
    const inspection = getLifecycleInspection();
    const versioned = getVersionedLifecycleInspection();
    const rootVersioned = getVersionedLifecycleInspectionFromRoot();

    expect(LIFECYCLE_VERSION_FROM_ROOT).toBe(LIFECYCLE_VERSION);
    expect(inspection.version).toBe(LIFECYCLE_VERSION);
    expect(versioned.version).toBe(LIFECYCLE_VERSION);
    expect(rootVersioned.version).toBe(LIFECYCLE_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(rootVersioned.readOnly).toBe(true);
    expect(versioned.inspection).toBe(inspection);
    expect(rootVersioned.inspection).toBe(inspection);
    expect(getLifecycleInspectionFromRoot()).toBe(inspection);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.inspection)).toBe(true);
    expect(Object.isFrozen(versioned.inspection.status)).toBe(true);
    expect(versioned.inspection.domain).toBe("lifecycle");
    expect(versioned.inspection.status.phase).toBe("ready");
    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.inspection as { domain: string }).domain = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.inspection.status as { phase: string }).phase = "boot";
    }).toThrow();
  });
});
