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

    expect(REPOSITORY_CAPABILITY_SURFACE_VERSION).toBe(8);
    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.readOnly).toBe(true);
    expect(surface.derivedVersion).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.exportVisibility.visible).toBe(true);
    expect(surface.schemaStability.stable).toBe(true);
    expect(surface.publicShape.shape).toBe("versioned-readonly-derived-surface");
    expect(surface.publicShapeSignature.value).toBe("versioned-readonly-derived-surface");
    expect(surface.sourceFingerprint.value).toBe("src/repository-capability-surface.ts@9");
    expect(surface.versionedSchemaDigest.value).toBe(`repository-capability-surface-schema@4#stable:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.introspectionTier.value).toBe("telemetry-adjacent");
    expect(surface.schemaSignature.value).toBe("repository-capability-surface@4");
    expect(surface.schemaVersionTag.value).toBe("repository-capability-surface/v4");
    expect(surface.schemaVersion.value).toBe(4);
    expect(surface.schemaVersionLabel.value).toBe("repository-capability-surface-schema@4");
    expect(surface.schemaVersionDigest.value).toBe("repository-capability-surface-schema@4#stable");
    expect(surface.versionedReadOnly.value).toBe(true);
    expect(surface.exportContractVersion.value).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.versionedSchemaContract.value).toBe(`repository-capability-surface/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionedSurface.value).toBe(`repository-capability-surface-schema/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionContract.value).toBe(`repository-capability-surface-schema-contract/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionChecksum.value).toBe("repository-capability-surface-schema@4#stable:v8");
    expect(surface.schemaVersionFingerprint.value).toBe(`repository-capability-surface-schema@4#stable:fingerprint:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(surface.schemaVersionAlias.value).toBe(`repository-capability-surface-schema-alias/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`);
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionFingerprint)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionAlias)).toBe(true);
    expect(getRepositoryCapabilitySurface()).toBe(surface);
    expect(exportRepositoryCapabilitySurfaceFromIndex()).toBe(surface);
    expect(versioned.surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().surface).toBe(surface);
    expect(getVersionedRepositoryCapabilitySurfaceFromIndex().version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(Object.isFrozen(versioned)).toBe(true);

    expect(() => {
      (surface as { schemaVersionAlias: { value: string } }).schemaVersionAlias.value = "mutated";
    }).toThrow();
  });
});
