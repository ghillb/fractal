import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  versionedSchemaFingerprint
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a versioned read-only derived field with shallow immutability", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.surface).toBe(surface);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
    expect(versionedSchemaFingerprint).toBe(surface.versionedSchemaFingerprint);
    expect(versionedSchemaFingerprint.schemaVersion).toBe(4);
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionSummary)).toBe(true);
    expect(Object.isFrozen(surface.versionedSchemaFingerprint)).toBe(true);
    expect(() => {
      (surface as { version: number }).version = 11;
    }).toThrow();
    expect(() => {
      (surface.versionedSchemaFingerprint as { schemaVersion: number }).schemaVersion = 99;
    }).toThrow();
  });
});
