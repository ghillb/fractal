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
  schemaVersionEdition,
  schemaVersionBlueprint,
  schemaVersionRegistry,
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a stable derived schema version invariant", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionInvariant).toBe(schemaVersionInvariant);
    expect(surface.derivedSchemaVersionTag).toBe(derivedSchemaVersionTag);
    expect(surface.schemaVersionOrdinal).toBe(schemaVersionOrdinal);
    expect(surface.derivedSchemaVersionFingerprint).toBe(derivedSchemaVersionFingerprint);
    expect(surface.schemaVersionLineage).toBe(schemaVersionLineage);
    expect(surface.schemaVersionRelease).toBe(schemaVersionRelease);
    expect(surface.schemaVersionChecksumLabel).toBe(schemaVersionChecksumLabel);
    expect(surface.schemaVersionEdition).toBe(schemaVersionEdition);
    expect(surface.schemaVersionBlueprint).toBe(schemaVersionBlueprint);
    expect(surface.schemaVersionRegistry).toBe(schemaVersionRegistry);
    expect(surface.schemaVersionInvariant.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.derivedSchemaVersionTag.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionInvariant.value).toBe(
      `repository-capability-surface-invariant/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.derivedSchemaVersionTag.value).toBe(
      `repository-capability-surface-derived-tag/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionOrdinal.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionOrdinal.value).toBe(
      `repository-capability-surface-schema-ordinal/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.derivedSchemaVersionFingerprint.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.derivedSchemaVersionFingerprint.value).toBe(
      `repository-capability-surface-derived-fingerprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionBlueprint.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionBlueprint.value).toBe(
      `repository-capability-surface-blueprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(surface.schemaVersionRegistry.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionRegistry.value).toBe(
      `repository-capability-surface-registry/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionInvariant)).toBe(true);
    expect(Object.isFrozen(surface.derivedSchemaVersionTag)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionOrdinal)).toBe(true);
    expect(Object.isFrozen(surface.derivedSchemaVersionFingerprint)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionLineage)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionRelease)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionChecksumLabel)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionEdition)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionBlueprint)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionRegistry)).toBe(true);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
    expect(() => {
      (surface as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionBlueprint as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionChecksumLabel as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionRegistry as { value: string }).value = "mutated";
    }).toThrow();
  });
});
