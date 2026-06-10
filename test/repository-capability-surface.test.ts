import { describe, expect, test } from "bun:test";
import {
  REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportRepositoryCapabilitySurface,
  getRepositoryCapabilitySurface,
  getVersionedRepositoryCapabilitySurface,
  schemaVersionInvariant
} from "../src/index.ts";

describe("repository capability surface", () => {
  test("exposes a stable derived schema version invariant", () => {
    const surface = getRepositoryCapabilitySurface();
    const versioned = getVersionedRepositoryCapabilitySurface();

    expect(surface.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(versioned.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionInvariant).toBe(schemaVersionInvariant);
    expect(surface.schemaVersionInvariant.version).toBe(REPOSITORY_CAPABILITY_SURFACE_VERSION);
    expect(surface.schemaVersionInvariant.value).toBe(
      `repository-capability-surface-invariant/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`
    );
    expect(Object.isFrozen(surface)).toBe(true);
    expect(Object.isFrozen(surface.schemaVersionInvariant)).toBe(true);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(exportRepositoryCapabilitySurface()).toBe(surface);
    expect(() => {
      (surface as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (surface.schemaVersionInvariant as { value: string }).value = "mutated";
    }).toThrow();
  });
});
