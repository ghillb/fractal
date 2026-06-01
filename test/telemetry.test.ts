import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata,
  schemaVersionContract,
  schemaVersionSnapshot,
  schemaVersionStamp,
  versionedSchemaSnapshot
} from "../src/index.ts";

describe("telemetry metadata", () => {
  test("exports a stable, immutable, versioned, visible summary", () => {
    const versioned = getVersionedTelemetryMetadata();
    const telemetry = versioned.telemetry;

    expect(TELEMETRY_VERSION).toBe(4);
    expect(versioned.version).toBe(TELEMETRY_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(telemetry.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.readOnly).toBe(true);
    expect(telemetry.derivedVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionField.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionField.label).toBe("schemaVersion");
    expect(telemetry.schemaVersionField.derived).toBe(true);
    expect(telemetry.schemaVersionSnapshot.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSnapshot.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSnapshot.immutable).toBe(true);
    expect(telemetry.schemaVersionSnapshot.derived).toBe(true);
    expect(telemetry.schemaVersionSnapshot.stableShape).toBe(true);
    expect(telemetry.versionedSchemaSummary.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionContract.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStamp.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStamp.stamp).toBe("telemetry-schema-stamp@4");
    expect(telemetry.schemaVersionStamp.derived).toBe(true);
    expect(telemetry.schemaVersionContract.label).toBe("telemetry-schema-contract@4");
    expect(telemetry.schemaVersionContract.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionContract.derived).toBe(true);
    expect(telemetry.versionedSchemaSummary.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSchemaSummary.readOnly).toBe(true);
    expect(telemetry.versionedSchemaSummary.derived).toBe(true);
    expect(telemetry.versionedSchemaSnapshot.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSchemaSnapshot.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSchemaSnapshot.readOnly).toBe(true);
    expect(telemetry.versionedSchemaSnapshot.derived).toBe(true);
    expect(telemetry.versionedSchemaSnapshot.stableShape).toBe(true);
    expect(telemetry.schemaVersionDescriptor.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionDescriptor.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionDescriptor.label).toBe("telemetry-schema-version@4");
    expect(telemetry.schemaVersionDescriptor.derived).toBe(true);
    expect(telemetry.derivedSchemaVersion.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedSchemaVersion.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedSchemaVersion.label).toBe("telemetry-schema-version@4");
    expect(telemetry.derivedSchemaVersion.derived).toBe(true);
    expect(exportTelemetryMetadata()).toBe(telemetry);
    expect(getTelemetryMetadata()).toBe(telemetry);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(telemetry)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionField)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionSnapshot)).toBe(true);
    expect(Object.isFrozen(telemetry.versionedSchemaSummary)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionContract)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionStamp)).toBe(true);
    expect(Object.isFrozen(telemetry.versionedSchemaSnapshot)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionDescriptor)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSchemaVersion)).toBe(true);
    expect(() => { (telemetry as { version: number }).version = 3; }).toThrow();
    expect(() => { (telemetry.schemaVersionField as { label: string }).label = "x"; }).toThrow();
    expect(() => { (telemetry.schemaVersionSnapshot as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.versionedSchemaSummary as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionContract as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionStamp as { stamp: string }).stamp = "q"; }).toThrow();
    expect(() => { (telemetry.versionedSchemaSnapshot as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionDescriptor as { label: string }).label = "y"; }).toThrow();
    expect(() => { (telemetry.derivedSchemaVersion as { label: string }).label = "z"; }).toThrow();
  });
});
