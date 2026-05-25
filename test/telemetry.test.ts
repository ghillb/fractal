import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata
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
    expect(telemetry.versionedSchemaSummary.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSchemaSummary.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSchemaSummary.readOnly).toBe(true);
    expect(telemetry.versionedSchemaSummary.derived).toBe(true);
    expect(exportTelemetryMetadata()).toBe(telemetry);
    expect(getTelemetryMetadata()).toBe(telemetry);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(telemetry)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionField)).toBe(true);
    expect(Object.isFrozen(telemetry.versionedSchemaSummary)).toBe(true);
    expect(() => { (telemetry as { version: number }).version = 3; }).toThrow();
    expect(() => { (telemetry.schemaVersionField as { label: string }).label = "x"; }).toThrow();
    expect(() => { (telemetry.versionedSchemaSummary as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
  });
});
