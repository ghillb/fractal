import { describe, expect, test } from "bun:test";
import {
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata
} from "../src/diagnostics.ts";
import {
  DIAGNOSTICS_VERSION as DIAGNOSTICS_VERSION_FROM_ROOT,
  exportDiagnosticsMetadata as exportDiagnosticsMetadataFromRoot,
  getDiagnosticsMetadata as getDiagnosticsMetadataFromRoot,
  getVersionedDiagnosticsMetadata as getVersionedDiagnosticsMetadataFromRoot
} from "../src/index.ts";

describe("diagnostics metadata", () => {
  test("exposes a versioned deeply immutable facade across the entrypoint boundary", () => {
    const versioned = getVersionedDiagnosticsMetadata();
    const rootVersioned = getVersionedDiagnosticsMetadataFromRoot();
    const metadata = exportDiagnosticsMetadata();
    const rootMetadata = exportDiagnosticsMetadataFromRoot();

    expect(DIAGNOSTICS_VERSION_FROM_ROOT).toBe(DIAGNOSTICS_VERSION);
    expect(versioned.version).toBe(DIAGNOSTICS_VERSION);
    expect(rootVersioned.version).toBe(DIAGNOSTICS_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(rootVersioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(rootVersioned.metadata).toBe(metadata);
    expect(getDiagnosticsMetadata()).toBe(metadata);
    expect(getDiagnosticsMetadataFromRoot()).toBe(metadata);
    expect(rootMetadata).toBe(metadata);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.metadata)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.fields)).toBe(true);
    expect(versioned.metadata.domain).toBe("diagnostics");
    expect(versioned.metadata.fields.map((field) => field.name)).toEqual([
      "version",
      "readOnly",
      "domain",
      "fields"
    ]);
    expect(rootVersioned).toEqual(versioned);

    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata as { domain: string }).domain = "mutated";
    }).toThrow();
  });
});
