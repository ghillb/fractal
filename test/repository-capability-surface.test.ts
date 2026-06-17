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
  schemaVersionManifestLabel,
  schemaVersionStabilityLabel,
  schemaVersionVersionLabel,
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a stable derived schema version invariant", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionVersionLabel).toBe(schemaVersionVersionLabel);
    expect(surface.schemaVersionVersionLabel.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionVersionLabel.value).toBe(
      `repository-capability-surface-version-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(Object.isFrozen(surface.schemaVersionVersionLabel)).toBe(true);
    expect(() => {
      (surface.schemaVersionVersionLabel as { value: string }).value = "mutated";
    }).toThrow();
    expect(Object.isFrozen(surface)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
  });
});
