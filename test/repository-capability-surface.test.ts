import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  derivedSchemaVersionTag,
  schemaVersionInvariant,
  schemaVersionOrdinal,
  derivedSchemaVersionFingerprint,
  schemaVersionLineage,
  schemaVersionRelease,
  schemaVersionChecksumLabel,
  schemaVersionDerivedCapabilitySignal,
  schemaVersionEdition,
  schemaVersionBlueprint,
  schemaVersionRegistry,
  schemaVersionManifestLabel,
  schemaVersionStabilityLabel,
  schemaVersionVersionLabel,
  schemaVersionLockLabel,
  schemaVersionReadOnlyDerivedField,
  versionedSchemaSchemaVersion,
  schemaVersionDerivedInspectionSurface,
  schemaVersionSurfaceVersion,
  shallowImmutabilityWitness,
  immutableDerivedSnapshot,
  schemaVersionSchemaStabilityWitness,
  schemaVersionBoundaryExport,
  schemaVersionSurfaceFingerprint,
  schemaVersionSurfaceLedger,
  schemaVersionSchemaStabilityFingerprint,
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a stable derived schema version invariant", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionVersionLabel).toBe(schemaVersionVersionLabel);
    expect(surface.schemaVersionLockLabel).toBe(schemaVersionLockLabel);
    expect(surface.schemaVersionVersionLabel.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionVersionLabel.value).toBe(
      `repository-capability-surface-version-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionLockLabel.value).toBe(
      `repository-capability-surface-lock-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionReadOnlyDerivedField).toBe(schemaVersionReadOnlyDerivedField);
    expect(surface.schemaVersionDerivedCapabilitySignal).toBe(schemaVersionDerivedCapabilitySignal);
    expect(surface.schemaVersionSurfaceVersion).toBe(schemaVersionSurfaceVersion);
    expect(surface.shallowImmutabilityWitness).toBe(shallowImmutabilityWitness);
    expect(surface.schemaVersionDerivedInspectionSurface).toBe(schemaVersionDerivedInspectionSurface);
    expect(surface.schemaVersionReadOnlyDerivedField.value).toBe(
      `repository-capability-surface-read-only-derived-field/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionDerivedCapabilitySignal.value).toBe(
      `repository-capability-surface-derived-capability-signal/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionSurfaceVersion.value).toBe(
      `repository-capability-surface-surface-version/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.shallowImmutabilityWitness.value).toBe(
      `repository-capability-surface-shallow-immutability-witness/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionDerivedInspectionSurface.value).toBe(
      `repository-capability-surface-derived-inspection-surface/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionSchemaStabilityWitness).toBe(schemaVersionSchemaStabilityWitness);
    expect(surface.schemaVersionSchemaStabilityWitness.value).toBe(
      `repository-capability-surface-schema-stability-witness/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionBoundaryExport).toBe(schemaVersionBoundaryExport);
    expect(surface.schemaVersionBoundaryExport.value).toBe(
      `repository-capability-surface-boundary-export/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionSurfaceLedger).toBe(schemaVersionSurfaceLedger);
    expect(surface.schemaVersionSchemaStabilityFingerprint).toBe(schemaVersionSchemaStabilityFingerprint);
    expect(surface.schemaVersionSurfaceLedger.schemaVersion).toBe(4);
    expect(surface.schemaVersionSurfaceLedger.readOnly).toBe(true);
    expect(surface.schemaVersionSurfaceLedger.stableShape).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSurfaceLedger)).toBe(true);
    expect(() => {
      (surface.schemaVersionSurfaceLedger as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(surface.schemaVersionSurfaceFingerprint).toBe(schemaVersionSurfaceFingerprint);
    expect(surface.schemaVersionSurfaceFingerprint.value).toBe(
      `repository-capability-surface-surface-fingerprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(Object.isFrozen(surface.schemaVersionSurfaceFingerprint)).toBe(true);
    expect(surface.schemaVersionSchemaStabilityFingerprint.value).toBe(
      `repository-capability-surface-schema-stability-fingerprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(Object.isFrozen(surface.schemaVersionSchemaStabilityFingerprint)).toBe(true);
    expect(() => {
      (surface.schemaVersionSchemaStabilityFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(surface.immutableDerivedSnapshot).toBe(immutableDerivedSnapshot);
    expect(surface.immutableDerivedSnapshot.value).toBe("frozen-shallow-readonly");
    expect(Object.isFrozen(surface.immutableDerivedSnapshot)).toBe(true);
    expect(() => {
      (surface.immutableDerivedSnapshot as { value: string }).value = "mutated";
    }).toThrow();
    expect(surface.versionedSchemaSchemaVersion).toBe(versionedSchemaSchemaVersion);
    expect(surface.versionedSchemaSchemaVersion.schemaVersion).toBe(4);
    expect(surface.versionedSchemaSchemaVersion.readOnly).toBe(true);
    expect(surface.versionedSchemaSchemaVersion.stableShape).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaSchemaVersion)).toBe(true);
    expect(() => {
      (surface.versionedSchemaSchemaVersion as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(Object.isFrozen(surface.schemaVersionVersionLabel)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionLockLabel)).toBe(true);
    expect(() => {
      (surface.schemaVersionVersionLabel as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionLockLabel as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionReadOnlyDerivedField as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionDerivedCapabilitySignal as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersion as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.shallowImmutabilityWitness as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionDerivedInspectionSurface as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaStabilityWitness as { value: string }).value = "mutated";
    }).toThrow();
    expect(Object.isFrozen(surface.schemaVersionBoundaryExport)).toBe(true);
    expect(() => {
      (surface.schemaVersionBoundaryExport as { value: string }).value = "mutated";
    }).toThrow();
    expect(Object.isFrozen(surface)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
  });
});
