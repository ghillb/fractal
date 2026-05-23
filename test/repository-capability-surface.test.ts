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

    expect(REPOSITORY_CAPABILITY_SURFACE_VERSION).toBe(5);
    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.readOnly).toBe(true);
    expect(surface.derivedVersion).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.exportVisibility.visible).toBe(true);
    expect(surface.schemaStability.stable).toBe(true);
    expect(surface.publicShape.shape).toBe("versioned-readonly-derived-surface");
    expect(surface.publicShapeSignature.value).toBe("versioned-readonly-derived-surface");
    expect(surface.sourceFingerprint.value).toBe("src/repository-capability-surface.ts@6");
    expect(surface.introspectionTier.value).toBe("telemetry-adjacent");
    expect(surface.schemaSignature.value).toBe("repository-capability-surface@4");
    expect(surface.schemaVersionTag.value).toBe("repository-capability-surface/v4");
    expect(surface.schemaVersion.value).toBe(4);
    expect(surface.versionedReadOnly.value).toBe(true);
    expect(surface.exportContractVersion.value).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.exportVisibility)).toBe(true);
    expect(Object.isFrozen(surface.schemaStability)).toBe(true);
    expect(Object.isFrozen(surface.publicShape)).toBe(true);
    expect(Object.isFrozen(surface.publicShapeSignature)).toBe(true);
    expect(Object.isFrozen(surface.sourceFingerprint)).toBe(true);
    expect(Object.isFrozen(surface.introspectionTier)).toBe(true);
    expect(Object.isFrozen(surface.schemaSignature)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionTag)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersion)).toBe(true);
    expect(Object.isFrozen(surface.versionedReadOnly)).toBe(true);
    expect(Object.isFrozen(surface.exportContractVersion)).toBe(true);
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
    expect(() => {
      (surface.publicShapeSignature as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.sourceFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.introspectionTier as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaSignature as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionTag as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersion as { value: number }).value = 4;
    }).toThrow();
    expect(() => {
      (surface.versionedReadOnly as { value: boolean }).value = false;
    }).toThrow();
    expect(() => {
      (surface.exportContractVersion as { value: number }).value = 0;
    }).toThrow();
  });
});
