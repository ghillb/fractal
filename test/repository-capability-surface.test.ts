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
  schemaVersionSurfaceVersionLabelDerived,
  schemaVersionSurfaceVersionLabelDerivedSummary,
  shallowImmutabilityWitness,
  schemaVersionShallowImmutabilityCheck,
  schemaVersionSchemaStabilityWitness,
  schemaVersionBoundaryExport,
  schemaVersionBoundaryVersion,
  schemaVersionBoundaryStability,
  schemaVersionSurfaceVersionLabel,
  schemaVersionSurfaceImmutabilityFingerprint,
  schemaVersionSchemaFingerprint,
  schemaVersionSurfaceFingerprint,
  schemaVersionSurfaceVersionHash,
  schemaVersionSurfaceStability,
  schemaVersionSurfaceImmutability,
  schemaVersionSurfaceDerivedVersion,
  schemaVersionSurfaceImmutabilityWitness,
  schemaVersionSurfaceLedger,
  schemaVersionSurfaceShapeDescriptor,
  schemaVersionSurfaceSchemaFingerprint,
  schemaVersionSchemaStabilityFingerprint,
  schemaVersionSchemaStabilityChecksum,
  versionedSchemaFingerprintLabel,
  versionedSchemaStabilityFingerprint,
  immutableDerivedSnapshot,
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
    expect(surface.shallowImmutabilityWitness).toBe(shallowImmutabilityWitness);
    expect(surface.schemaVersionShallowImmutabilityCheck).toBe(schemaVersionShallowImmutabilityCheck);
    expect(surface.schemaVersionSchemaStabilityWitness).toBe(schemaVersionSchemaStabilityWitness);
    expect(surface.schemaVersionBoundaryExport).toBe(schemaVersionBoundaryExport);
    expect(surface.schemaVersionBoundaryVersion).toBe(schemaVersionBoundaryVersion);
    expect(surface.schemaVersionBoundaryStability).toBe(schemaVersionBoundaryStability);
    expect(surface.schemaVersionSurfaceVersionLabel).toBe(schemaVersionSurfaceVersionLabel);
    expect(surface.schemaVersionSurfaceImmutabilityFingerprint).toBe(schemaVersionSurfaceImmutabilityFingerprint);
    expect(surface.schemaVersionSchemaFingerprint).toBe(schemaVersionSchemaFingerprint);
    expect(surface.schemaVersionSurfaceFingerprint).toBe(schemaVersionSurfaceFingerprint);
    expect(surface.schemaVersionSurfaceVersionHash).toBe(schemaVersionSurfaceVersionHash);
    expect(surface.schemaVersionSurfaceStability).toBe(schemaVersionSurfaceStability);
    expect(surface.schemaVersionSurfaceImmutability).toBe(schemaVersionSurfaceImmutability);
    expect(surface.schemaVersionSurfaceDerivedVersion).toBe(schemaVersionSurfaceDerivedVersion);
    expect(surface.schemaVersionSurfaceImmutabilityWitness).toBe(schemaVersionSurfaceImmutabilityWitness);
    expect(surface.schemaVersionSurfaceLedger).toBe(schemaVersionSurfaceLedger);
    expect(surface.schemaVersionSurfaceShapeDescriptor).toBe(schemaVersionSurfaceShapeDescriptor);
    expect(surface.schemaVersionSurfaceSchemaFingerprint).toBe(schemaVersionSurfaceSchemaFingerprint);
    expect(surface.schemaVersionSchemaStabilityFingerprint).toBe(schemaVersionSchemaStabilityFingerprint);
    expect(surface.schemaVersionSchemaStabilityChecksum).toBe(schemaVersionSchemaStabilityChecksum);
    expect(surface.versionedSchemaFingerprintLabel).toBe(versionedSchemaFingerprintLabel);
    expect(surface.versionedSchemaStabilityFingerprint).toBe(versionedSchemaStabilityFingerprint);
    expect(surface.immutableDerivedSnapshot).toBe(immutableDerivedSnapshot);
    expect(surface.versionedSchemaSchemaVersion).toBe(versionedSchemaSchemaVersion);


    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.repositoryCapabilitySurfaceVersion)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionVisibilityGuard)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionReadOnlyDerivedFieldSignature)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaStabilityFingerprint)).toBe(true);
    expect(() => {
      (surface.schemaVersionBoundaryVersion as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.immutableDerivedSnapshot as { value: string }).value = "mutated";
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
      (surface.schemaVersionSurfaceImmutabilityFingerprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceDerivedVersion as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionHash as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionSurfaceVersionLabelDerived as { value: string }).value = "mutated";
    }).toThrow();
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
  });
});
