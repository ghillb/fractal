import { describe, expect, test } from "bun:test";
import {
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata
} from "../src/index.ts";

describe("diagnostics metadata facade", () => {
  test("exposes a versioned schema marker with shallow immutability", () => {
    const versioned = getVersionedDiagnosticsMetadata();
    const metadata = exportDiagnosticsMetadata();

    expect(versioned.version).toBe(DIAGNOSTICS_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(metadata.schemaVersion.value).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.versionedSchemaVersion.schemaVersion).toBe(DIAGNOSTICS_VERSION);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.metadata)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.schemaVersion)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.versionedSchemaVersion)).toBe(true);
    expect(versioned.metadata).toEqual(expect.objectContaining({
      version: DIAGNOSTICS_VERSION,
      readOnly: true,
      domain: "diagnostics",
      derivedVersion: DIAGNOSTICS_VERSION,
      schemaVersion: { version: DIAGNOSTICS_VERSION, value: DIAGNOSTICS_VERSION, derived: true },
      versionedSchemaVersion: { version: DIAGNOSTICS_VERSION, readOnly: true, schemaVersion: DIAGNOSTICS_VERSION, derived: true, stableShape: true }
    }));
    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata.schemaVersion as { value: number }).value = 2;
    }).toThrow();
  });
});
