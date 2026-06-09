import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  schemaVersionContractSignature,
  schemaVersionManifest,
  schemaVersionSummary,
  versionedSchemaAnchor,
  versionedSchemaFingerprint,
  versionedSchemaStability
} from "../src/repository-capability-surface.ts";
import {
  exportRepositoryCapabilitySurface as exportRepositoryCapabilitySurfaceFromIndex,
  getVersionedRepositoryCapabilitySurface as getVersionedRepositoryCapabilitySurfaceFromIndex
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exports a versioned immutable derived field with stable shape", () => {
    const surface = exportRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(REPOSITORY_CAPABILITY_SURFACE_VERSION).toBe(10);
    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.readOnly).toBe(true);
    expect(surface.derivedVersion).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.sourceFingerprint.value).toBe("src/repository-capability-surface.ts@10");
    expect(surface.capabilitySurfaceDescriptor.value).toBe("repository-capability-surface-descriptor@10");
    expect(surface.versionedSchemaDigest.value).toBe(`repository-capability-surface-schema@4#stable:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionChecksum.value).toBe("repository-capability-surface-schema@4#stable:v8");
    expect(surface.versionedSchemaVersion.schemaVersion).toBe(4);
    expect(surface.schemaVersionStability.value).toBe("schema-version-stable");
    expect(surface.schemaVersionLock.value).toBe("schema-version-lock");
    expect(surface.schemaVersionContractSignature.value).toBe(`repository-capability-surface-schema-contract/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.versionedSchemaAnchor.schemaVersion).toBe(4);
    expect(surface.versionedSchemaStability.schemaVersion).toBe(4);
    expect(surface.schemaVersionSummary.schemaVersion).toBe(4);
    expect(surface.schemaVersionManifest.schemaVersion).toBe(4);
    expect(surface.versionedSchemaFingerprint.schemaVersion).toBe(4);
    expect(Object.isFrozen(surface.schemaVersionStability)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaStability)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionLock)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionContractSignature)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaAnchor)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSummary)).toBe(true);
    expect(Object.isFrozen(surface.capabilitySurfaceDescriptor)).toBe(true);
    expect(Object.isFrozen(surface)).toBe(true);
    expect(() => { (surface as any).schemaVersionLock = null; }).toThrow();
    expect(() => { (surface as any).schemaVersionContractSignature = null; }).toThrow();
    expect(() => { (surface.versionedSchemaAnchor as any).schemaVersion = 5; }).toThrow();
    expect(() => { (surface.schemaVersionSummary as any).schemaVersion = 5; }).toThrow();
    expect(() => { (surface.versionedSchemaFingerprint as any).schemaVersion = 5; }).toThrow();
    expect(() => { (surface.capabilitySurfaceDescriptor as any).value = "mutated"; }).toThrow();
    expect(Object.isFrozen(surface.versionedSchemaVersion)).toBe(true);
    expect(versioned.surface.versionedSchemaStability).toBe(surface.versionedSchemaStability);
    expect(versionedSchemaStability).toBe(surface.versionedSchemaStability);
    expect(schemaVersionSummary).toBe(surface.schemaVersionSummary);
    expect(schemaVersionManifest).toBe(surface.schemaVersionManifest);
    expect(versionedSchemaFingerprint).toBe(surface.versionedSchemaFingerprint);
    expect(getRepositoryCapabilitySurface()).toBe(surface);
    expect(exportRepositoryCapabilitySurfaceFromIndex()).toBe(surface);
    expect(versioned.surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().surface).toBe(surface);
    expect(Object.isFrozen(versioned)).toBe(true);
  });
});
