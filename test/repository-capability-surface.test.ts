import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  versionedSchemaAnchor
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
    expect(surface.versionedSchemaDigest.value).toBe(`repository-capability-surface-schema@4#stable:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionChecksum.value).toBe("repository-capability-surface-schema@4#stable:v8");
    expect(surface.versionedSchemaVersion.schemaVersion).toBe(4);
    expect(surface.schemaVersionStability.value).toBe("schema-version-stable");
    expect(surface.schemaVersionLock.value).toBe("schema-version-lock");
    expect(surface.versionedSchemaAnchor.schemaVersion).toBe(4);
    expect(Object.isFrozen(surface.schemaVersionStability)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionLock)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaAnchor)).toBe(true);
    expect(Object.isFrozen(surface)).toBe(true);
    expect(() => { (surface as any).schemaVersionLock = null; }).toThrow();
    expect(() => { (surface.versionedSchemaAnchor as any).schemaVersion = 5; }).toThrow();
    expect(Object.isFrozen(surface.versionedSchemaVersion)).toBe(true);
    expect(getRepositoryCapabilitySurface()).toBe(surface);
    expect(exportRepositoryCapabilitySurfaceFromIndex()).toBe(surface);
    expect(versioned.surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().surface).toBe(surface);
    expect(Object.isFrozen(versioned)).toBe(true);
  });
});
