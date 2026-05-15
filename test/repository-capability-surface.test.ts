import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface
} from "../src/repository-capability-surface.ts";
import {
  exportRepositoryCapabilitySurface as exportRepositoryCapabilitySurfaceFromIndex,
  getVersionedRepositoryCapabilitySurface as getVersionedRepositoryCapabilitySurfaceFromIndex
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exports a versioned immutable derived field with stable shape", () => {
    const surface = exportRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(REPOSITORY_CAPABILITY_SURFACE_VERSION).toBe(2);
    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.readOnly).toBe(true);
    expect(surface.derivedVersion).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.exportVisibility.visible).toBe(true);
    expect(surface.schemaStability.stable).toBe(true);
    expect(surface.publicShape.shape).toBe("versioned-readonly-derived-surface");
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.exportVisibility)).toBe(true);
    expect(Object.isFrozen(surface.schemaStability)).toBe(true);
    expect(Object.isFrozen(surface.publicShape)).toBe(true);
    expect(getRepositoryCapabilitySurface()).toBe(surface);
    expect(exportRepositoryCapabilitySurfaceFromIndex()).toBe(surface);
    expect(versioned.surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(Object.isFrozen(versioned)).toBe(true);

    expect(() => {
      (surface as { derivedVersion: number }).derivedVersion = 2;
    }).toThrow();
    expect(() => {
      (surface.exportVisibility as { visible: boolean }).visible = false;
    }).toThrow();
    expect(() => {
      (surface.schemaStability as { stable: boolean }).stable = false;
    }).toThrow();
    expect(() => {
      (surface.publicShape as { shape: string }).shape = "mutated";
    }).toThrow();
  });
});
