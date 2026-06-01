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
    expect(metadata.publicSchema.schemaVersion).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.versionedSchemaVersion.schemaVersion).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.schemaVersionDescriptor.schemaVersion).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.schemaVersionDescriptor.label).toBe("diagnostics@6");
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.metadata)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.schemaVersion)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.versionedSchemaVersion)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.schemaVersionDescriptor)).toBe(true);
    expect(versioned.metadata).toEqual(expect.objectContaining({
      version: DIAGNOSTICS_VERSION,
      readOnly: true,
      domain: "diagnostics",
      derivedVersion: DIAGNOSTICS_VERSION,
      schemaVersion: { version: DIAGNOSTICS_VERSION, value: DIAGNOSTICS_VERSION, derived: true },
      publicSchema: { version: DIAGNOSTICS_VERSION, readOnly: true, domain: "diagnostics", derivedVersion: DIAGNOSTICS_VERSION, schemaVersion: DIAGNOSTICS_VERSION, stableShape: true },
      versionedSchemaVersion: { version: DIAGNOSTICS_VERSION, readOnly: true, schemaVersion: DIAGNOSTICS_VERSION, derived: true, stableShape: true },
      schemaVersionDescriptor: { version: DIAGNOSTICS_VERSION, readOnly: true, schemaVersion: DIAGNOSTICS_VERSION, label: "diagnostics@6", derived: true, stableShape: true }
    }));
    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata.schemaVersion as { value: number }).value = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata.publicSchema as { schemaVersion: number }).schemaVersion = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata.schemaVersionDescriptor as { label: string }).label = "x";
    }).toThrow();
  });
});
