import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata
} from "../src/telemetry.ts";
import { exportTelemetryMetadata as exportTelemetryMetadataFromIndex, getVersionedTelemetryMetadata as getVersionedTelemetryMetadataFromIndex } from "../src/index.ts";

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
    expect(telemetry.derivedVisibility.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedVisibility.label).toBe("public-export-visible");
    expect(telemetry.derivedVisibility.derived).toBe(true);
    expect(telemetry.exportVisibility.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.exportVisibility.visible).toBe(true);
    expect(telemetry.exportVisibility.derived).toBe(true);
    expect(telemetry.sourceFingerprint.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.sourceFingerprint.value).toBe("src/telemetry.ts@4");
    expect(telemetry.sourceFingerprint.derived).toBe(true);
    expect(telemetry.derivedSurface.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedSurface.shape).toBe("versioned-readonly-derived-facade");
    expect(telemetry.derivedSurface.derived).toBe(true);
    expect(telemetry.schemaDigest.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaDigest.value).toBe("telemetry@4:13");
    expect(telemetry.schemaDigest.derived).toBe(true);
    expect(telemetry.telemetrySummary.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.telemetrySummary.fieldCount).toBe(15);
    expect(telemetry.telemetrySummary.derived).toBe(true);
    expect(telemetry.schemaVersionLabel.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionLabel.value).toBe("telemetry-schema@4");
    expect(telemetry.schemaVersionLabel.derived).toBe(true);
    expect(telemetry.derivedContractLabel.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedContractLabel.label).toBe("telemetry-contract@4");
    expect(telemetry.derivedContractLabel.derived).toBe(true);
    expect(telemetry.versionedSurface.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.versionedSurface.readOnly).toBe(true);
    expect(telemetry.versionedSurface.derived).toBe(true);
    expect(telemetry.versionedSurface.shape).toBe("telemetry-versioned-surface@4");
    expect(exportTelemetryMetadata()).toBe(telemetry);
    expect(getTelemetryMetadata()).toBe(telemetry);
    expect(exportTelemetryMetadataFromIndex()).toBe(telemetry);
    expect(getVersionedTelemetryMetadataFromIndex().telemetry).toBe(telemetry);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(telemetry)).toBe(true);
    expect(Object.isFrozen(telemetry.fields)).toBe(true);
    expect(Object.isFrozen(telemetry.snapshot)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSignature)).toBe(true);
    expect(Object.isFrozen(telemetry.publicShape)).toBe(true);
    expect(Object.isFrozen(telemetry.exportVisibility)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedVisibility)).toBe(true);
    expect(Object.isFrozen(telemetry.sourceFingerprint)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSurface)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaDigest)).toBe(true);
    expect(Object.isFrozen(telemetry.telemetrySummary)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionLabel)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedContractLabel)).toBe(true);
    expect(Object.isFrozen(telemetry.versionedSurface)).toBe(true);
    expect(() => { (telemetry as { version: number }).version = 3; }).toThrow();
    expect(() => { (telemetry.exportVisibility as { visible: boolean }).visible = false; }).toThrow();
    expect(() => { (telemetry.derivedVisibility as { label: string }).label = "x"; }).toThrow();
    expect(() => { (telemetry.publicShape as { stableShape: boolean }).stableShape = false; }).toThrow();
    expect(() => { (telemetry.sourceFingerprint as { value: string }).value = "x"; }).toThrow();
    expect(() => { (telemetry.derivedSurface as { shape: string }).shape = "x"; }).toThrow();
    expect(() => { (telemetry.schemaDigest as { value: string }).value = "x"; }).toThrow();
    expect(() => { (telemetry.telemetrySummary as { fieldCount: number }).fieldCount = 0; }).toThrow();
    expect(() => { (telemetry.schemaVersionLabel as { value: string }).value = "x"; }).toThrow();
    expect(() => { (telemetry.derivedContractLabel as { label: string }).label = "x"; }).toThrow();
    expect(() => { (telemetry.versionedSurface as { shape: string }).shape = "x"; }).toThrow();
  });
});
