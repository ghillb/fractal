import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  schemaVersionVersionLabel,
  schemaVersionVisibilityGuard,
  schemaVersionLockLabel,
  schemaVersionReadOnlyDerivedField,
  schemaVersionReadOnlyDerivedFieldSignature,
  repositoryCapabilitySurfaceVersion,
  schemaVersionReadOnlyBoundary,
  schemaVersionSchemaVersionMarker,
  schemaVersionDerivedCapabilitySignal,
  schemaVersionSurfaceVersion,
  schemaVersionSurfaceVersionLabelDerivedSummary,
  schemaVersionSurfaceVersionLabelDerivedSnapshot,
  schemaVersionSchemaStabilityFingerprintVersioned,
  schemaVersionSurfaceVersionLabelDerivedAudit,
  schemaVersionSurfaceVersionLabelDerivedStability,
  schemaVersionSurfaceVersionLabelDerivedVersionedField,
  shallowImmutabilityWitness,
  schemaVersionShallowImmutabilityCheck,
  schemaVersionSchemaStabilityWitness,
  schemaVersionBoundaryExport,
  schemaVersionBoundaryVersion,
  schemaVersionBoundaryStability,
  schemaVersionBoundarySchemaVersion,
  schemaVersionSurfaceVersionLabel,
  schemaVersionSurfaceVersionLabelChecksum,
  schemaVersionSurfaceImmutabilityFingerprint,
  schemaVersionSurfaceVersionChecksum,
  schemaVersionSurfaceImmutabilitySummary,
  schemaVersionInspectionStamp,
  schemaVersionVersionedMetadataField,
  schemaVersionSchemaStabilityReport,
  schemaVersionSchemaFingerprint,
  schemaVersionSurfaceFingerprint,
  schemaVersionSurfaceLineage,
  schemaVersionSchemaShapeFingerprint,
  schemaVersionSurfaceVersionHash,
  schemaVersionSurfaceVersionLabelDerived,
  schemaVersionSurfaceStability,
  schemaVersionSurfaceImmutability,
  schemaVersionSurfaceDerivedVersion,
  schemaVersionSurfaceSchemaVersion,
  schemaVersionSurfaceImmutabilityWitness,
  schemaVersionSurfaceLedger,
  schemaVersionSurfaceShapeDescriptor,
  schemaVersionSurfaceSchemaFingerprint,
  schemaVersionSurfaceSchemaStability,
  schemaVersionSurfaceSchemaStabilityWitness,
  schemaVersionDerivedPublicBoundary,
  schemaVersionSchemaStabilityFingerprint,
  schemaVersionSchemaStabilityChecksum,
  versionedSchemaFingerprintLabel,
  versionedSchemaStabilityFingerprint,
  immutableDerivedSnapshot,
  exportStabilityWitness,
  shallowImmutabilitySummary,
  versionedSchemaSchemaVersion
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a stable derived schema version invariant", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionVersionLabel).toBe(schemaVersionVersionLabel);
    expect(surface.schemaVersionVisibilityGuard).toBe(schemaVersionVisibilityGuard);
    expect(surface.schemaVersionLockLabel).toBe(schemaVersionLockLabel);
    expect(surface.schemaVersionReadOnlyDerivedField).toBe(schemaVersionReadOnlyDerivedField);
    expect(surface.schemaVersionReadOnlyDerivedFieldSignature).toBe(schemaVersionReadOnlyDerivedFieldSignature);
        expect(surface.repositoryCapabilitySurfaceVersion).toBe(repositoryCapabilitySurfaceVersion);
    expect(surface.schemaVersionReadOnlyBoundary).toBe(schemaVersionReadOnlyBoundary);
    expect(surface.schemaVersionSchemaVersionMarker).toBe(schemaVersionSchemaVersionMarker);
    expect(surface.schemaVersionDerivedCapabilitySignal).toBe(schemaVersionDerivedCapabilitySignal);
    expect(surface.schemaVersionSurfaceVersion).toBe(schemaVersionSurfaceVersion);
    expect(surface.schemaVersionSurfaceVersionLabelDerived).toBe(schemaVersionSurfaceVersionLabelDerived);
    expect(surface.schemaVersionSurfaceVersionLabelDerivedSummary).toBe(schemaVersionSurfaceVersionLabelDerivedSummary);
    expect(surface.schemaVersionSurfaceVersionLabelDerivedSnapshot).toBe(schemaVersionSurfaceVersionLabelDerivedSnapshot);
    expect(surface.schemaVersionSchemaStabilityFingerprintVersioned).toBe(schemaVersionSchemaStabilityFingerprintVersioned);
    expect(surface.schemaVersionSurfaceVersionLabelDerivedAudit).toBe(schemaVersionSurfaceVersionLabelDerivedAudit);
    expect(surface.schemaVersionSurfaceVersionLabelDerivedStability).toBe(schemaVersionSurfaceVersionLabelDerivedStability);
    expect(surface.schemaVersionSurfaceVersionLabelDerivedVersionedField).toBe(schemaVersionSurfaceVersionLabelDerivedVersionedField);
    expect(surface.shallowImmutabilityWitness).toBe(shallowImmutabilityWitness);
    expect(surface.schemaVersionShallowImmutabilityCheck).toBe(schemaVersionShallowImmutabilityCheck);
    expect(surface.schemaVersionSchemaStabilityWitness).toBe(schemaVersionSchemaStabilityWitness);
    expect(surface.schemaVersionBoundaryExport).toBe(schemaVersionBoundaryExport);
    expect(surface.schemaVersionBoundaryVersion).toBe(schemaVersionBoundaryVersion);
    expect(surface.schemaVersionBoundaryStability).toBe(schemaVersionBoundaryStability);
    expect(surface.schemaVersionBoundarySchemaVersion).toBe(schemaVersionBoundarySchemaVersion);
    expect(surface.schemaVersionSurfaceVersionLabel).toBe(schemaVersionSurfaceVersionLabel);
    expect(surface.schemaVersionSurfaceVersionLabelChecksum).toBe(schemaVersionSurfaceVersionLabelChecksum);
    expect(surface.schemaVersionSurfaceImmutabilityFingerprint).toBe(schemaVersionSurfaceImmutabilityFingerprint);
    expect(surface.schemaVersionSurfaceVersionChecksum).toBe(schemaVersionSurfaceVersionChecksum);
    expect(surface.schemaVersionSurfaceImmutabilitySummary).toStrictEqual(schemaVersionSurfaceImmutabilitySummary);
    expect(surface.schemaVersionInspectionStamp).toBe(schemaVersionInspectionStamp);
    expect(surface.schemaVersionVersionedMetadataField).toBe(schemaVersionVersionedMetadataField);
    expect(surface.schemaVersionSchemaStabilityReport).toBe(schemaVersionSchemaStabilityReport);
    expect(surface.schemaVersionSchemaFingerprint).toBe(schemaVersionSchemaFingerprint);
    expect(surface.schemaVersionSurfaceFingerprint).toBe(schemaVersionSurfaceFingerprint);
    expect(surface.schemaVersionSurfaceLineage).toBe(schemaVersionSurfaceLineage);
    expect(surface.schemaVersionSchemaShapeFingerprint).toBe(schemaVersionSchemaShapeFingerprint);
    expect(surface.schemaVersionSurfaceVersionHash).toBe(schemaVersionSurfaceVersionHash);
    expect(surface.schemaVersionSurfaceVersionLabelDerived).toBe(schemaVersionSurfaceVersionLabelDerived);
    expect(surface.schemaVersionSurfaceStability).toBe(schemaVersionSurfaceStability);
    expect(surface.schemaVersionSurfaceImmutability).toBe(schemaVersionSurfaceImmutability);
    expect(surface.schemaVersionSurfaceDerivedVersion).toBe(schemaVersionSurfaceDerivedVersion);
    expect(surface.schemaVersionSurfaceSchemaVersion).toBe(schemaVersionSurfaceSchemaVersion);
    expect(surface.schemaVersionSurfaceImmutabilityWitness).toBe(schemaVersionSurfaceImmutabilityWitness);
    expect(surface.schemaVersionSurfaceLedger).toBe(schemaVersionSurfaceLedger);
    expect(surface.schemaVersionSurfaceShapeDescriptor).toBe(schemaVersionSurfaceShapeDescriptor);
    expect(surface.schemaVersionSurfaceSchemaFingerprint).toBe(schemaVersionSurfaceSchemaFingerprint);
    expect(surface.schemaVersionSurfaceSchemaStability).toBe(schemaVersionSurfaceSchemaStability);
    expect(surface.schemaVersionSurfaceSchemaStabilityWitness).toBe(schemaVersionSurfaceSchemaStabilityWitness);
    expect(surface.schemaVersionDerivedPublicBoundary).toBe(schemaVersionDerivedPublicBoundary);
    expect(surface.schemaVersionSchemaStabilityFingerprint).toBe(schemaVersionSchemaStabilityFingerprint);
    expect(surface.schemaVersionSchemaStabilityChecksum).toBe(schemaVersionSchemaStabilityChecksum);
    expect(surface.versionedSchemaFingerprintLabel).toBe(versionedSchemaFingerprintLabel);
    expect(surface.versionedSchemaStabilityFingerprint).toBe(versionedSchemaStabilityFingerprint);
    expect(surface.immutableDerivedSnapshot).toBe(immutableDerivedSnapshot);
    expect(surface.exportStabilityWitness).toBe(exportStabilityWitness);
    expect(surface.shallowImmutabilitySummary).toBe(shallowImmutabilitySummary);
    expect(surface.versionedSchemaSchemaVersion).toBe(versionedSchemaSchemaVersion);


    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSurfaceVersionLabelDerivedSnapshot)).toBe(true);
    expect(Object.isFrozen(surface.repositoryCapabilitySurfaceVersion)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionVisibilityGuard)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionBoundarySchemaVersion)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionReadOnlyDerivedFieldSignature)).toBe(true);
        expect(Object.isFrozen(surface.schemaVersionSchemaStabilityFingerprintVersioned)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSurfaceVersionLabelDerivedAudit)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSurfaceVersionLabelDerivedStability)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSurfaceVersionLabelDerivedVersionedField)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSchemaShapeFingerprint)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaStabilityFingerprint)).toBe(true);
    expect(() => {
      (surface.schemaVersionBoundaryVersion as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionBoundarySchemaVersion as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(() => {
      (surface.immutableDerivedSnapshot as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.exportStabilityWitness as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.shallowImmutabilitySummary as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionReadOnlyBoundary as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionVisibilityGuard as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceImmutabilityWitness as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaVersionMarker as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionLabel as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionLabelChecksum as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionLabelDerived as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaShapeFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaStabilityFingerprintVersioned as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceImmutabilityFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionChecksum as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceImmutabilitySummary as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionInspectionStamp as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionVersionedMetadataField as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaStabilityReport as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceDerivedVersion as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceSchemaVersion as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionHash as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionLabelDerived as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSchemaStabilityFingerprintVersioned as { schemaVersion: number }).schemaVersion = 5;
    }).toThrow();
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
  });
});
