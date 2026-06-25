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
  schemaVersionSurfaceVersion,
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
    expect(surface.schemaVersionReadOnlyDerivedField.value).toBe(
      `repository-capability-surface-read-only-derived-field/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionDerivedCapabilitySignal.value).toBe(
      `repository-capability-surface-derived-capability-signal/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionSurfaceVersion.value).toBe(
      `repository-capability-surface-surface-version/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
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
    expect(Object.isFrozen(surface)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
  });
});
