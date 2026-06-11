import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  derivedSchemaVersionTag,
  schemaVersionInvariant,
  schemaVersionOrdinal,
  derivedSchemaVersionFingerprint
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
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionInvariant)).toBe(true);
    expect(Object.isFrozen(surface.derivedSchemaVersionTag)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionOrdinal)).toBe(true);
    expect(Object.isFrozen(surface.derivedSchemaVersionFingerprint)).toBe(true);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
    expect(() => {
      (surface as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionInvariant as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.derivedSchemaVersionTag as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.schemaVersionOrdinal as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (surface.derivedSchemaVersionFingerprint as { value: string }).value = "mutated";
    }).toThrow();
  });
});
