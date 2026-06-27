import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata,
  schemaVersionContract,
  schemaVersionSnapshot,
  schemaVersionSummary,
  schemaVersionStamp,
  schemaVersionSurface,
  schemaVersionFingerprint,
  schemaVersionLock,
  schemaVersionReadOnlyDerivedField,
  derivedSchemaFingerprint,
  schemaVersionEnvelope,
  schemaVersionAnchor,
  schemaVersionBeacon,
  schemaVersionSignature,
  schemaVersionDerivedSummary,
  schemaVersionStability,
  schemaVersionVersionedField,
  telemetryContract,
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
    expect(telemetry.schemaVersionSummary.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSummary.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSummary.readOnly).toBe(true);
    expect(telemetry.schemaVersionSummary.derived).toBe(true);
    expect(telemetry.schemaVersionSummary.stableShape).toBe(true);
    expect(telemetry.schemaVersionContract.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStamp.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStamp.stamp).toBe("telemetry-schema-stamp@4");
    expect(telemetry.schemaVersionStamp.derived).toBe(true);
    expect(telemetry.schemaVersionContract.label).toBe("telemetry-schema-contract@4");
    expect(telemetry.schemaVersionContract.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionContract.derived).toBe(true);
    expect(telemetry.schemaVersionSurface.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSurface.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSurface.readOnly).toBe(true);
    expect(telemetry.schemaVersionSurface.derived).toBe(true);
    expect(telemetry.schemaVersionSurface.stableShape).toBe(true);
    expect(telemetry.schemaVersionFingerprint.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionFingerprint.fingerprint).toBe("telemetry-schema-fingerprint@4");
    expect(telemetry.schemaVersionFingerprint.readOnly).toBe(true);
    expect(telemetry.schemaVersionFingerprint.derived).toBe(true);
    expect(telemetry.schemaVersionLock.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionLock.label).toBe("telemetry-schema-lock@4");
    expect(telemetry.schemaVersionLock.readOnly).toBe(true);
    expect(telemetry.schemaVersionLock.derived).toBe(true);
    expect(telemetry.schemaVersionReadOnlyDerivedField.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionReadOnlyDerivedField.label).toBe("telemetry-schema-read-only-derived-field@4");
    expect(telemetry.schemaVersionReadOnlyDerivedField.readOnly).toBe(true);
    expect(telemetry.schemaVersionReadOnlyDerivedField.derived).toBe(true);
    expect(telemetry.derivedSchemaFingerprint.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.derivedSchemaFingerprint.fingerprint).toBe("telemetry-derived-schema-fingerprint@4");
    expect(telemetry.derivedSchemaFingerprint.readOnly).toBe(true);
    expect(telemetry.derivedSchemaFingerprint.derived).toBe(true);
    expect(telemetry.schemaVersionEnvelope.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionEnvelope.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionEnvelope.readOnly).toBe(true);
    expect(telemetry.schemaVersionEnvelope.derived).toBe(true);
    expect(telemetry.schemaVersionEnvelope.stableShape).toBe(true);
    expect(telemetry.schemaVersionAnchor.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionAnchor.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionAnchor.readOnly).toBe(true);
    expect(telemetry.schemaVersionAnchor.derived).toBe(true);
    expect(telemetry.schemaVersionAnchor.stableShape).toBe(true);
    expect(telemetry.schemaVersionBeacon.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionBeacon.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionBeacon.readOnly).toBe(true);
    expect(telemetry.schemaVersionBeacon.derived).toBe(true);
    expect(telemetry.schemaVersionBeacon.stableShape).toBe(true);
    expect(telemetry.schemaVersionSignature.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSignature.label).toBe("telemetry-schema-signature@4");
    expect(telemetry.schemaVersionSignature.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionSignature.readOnly).toBe(true);
    expect(telemetry.schemaVersionSignature.derived).toBe(true);
    expect(telemetry.schemaVersionDerivedSummary.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionDerivedSummary.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionDerivedSummary.label).toBe("telemetry-schema-derived-summary@4");
    expect(telemetry.schemaVersionDerivedSummary.readOnly).toBe(true);
    expect(telemetry.schemaVersionDerivedSummary.derived).toBe(true);
    expect(telemetry.schemaVersionDerivedSummary.stableShape).toBe(true);
    expect(telemetry.schemaVersionStability.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStability.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionStability.readOnly).toBe(true);
    expect(telemetry.schemaVersionStability.derived).toBe(true);
    expect(telemetry.schemaVersionStability.stableShape).toBe(true);
    expect(telemetry.schemaVersionVersionedField.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionVersionedField.schemaVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.schemaVersionVersionedField.readOnly).toBe(true);
    expect(telemetry.schemaVersionVersionedField.derived).toBe(true);
    expect(telemetry.schemaVersionVersionedField.stableShape).toBe(true);
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
    expect(Object.isFrozen(telemetry.schemaVersionSummary)).toBe(true);
    expect(Object.isFrozen(telemetry.telemetryContract)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionContract)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionStamp)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionSurface)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionFingerprint)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionLock)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionReadOnlyDerivedField)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSchemaFingerprint)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionEnvelope)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionAnchor)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionBeacon)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionSignature)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionDerivedSummary)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionStability)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionVersionedField)).toBe(true);
    expect(Object.isFrozen(telemetry.versionedSchemaSnapshot)).toBe(true);
    expect(Object.isFrozen(telemetry.schemaVersionDescriptor)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSchemaVersion)).toBe(true);
    expect(() => { (telemetry as { version: number }).version = 3; }).toThrow();
    expect(() => { (telemetry.schemaVersionField as { label: string }).label = "x"; }).toThrow();
    expect(() => { (telemetry.schemaVersionSnapshot as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.versionedSchemaSummary as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionSummary as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.telemetryContract as { label: string }).label = "bad"; }).toThrow();
    expect(() => { (telemetry.schemaVersionContract as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionStamp as { stamp: string }).stamp = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionSurface as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionFingerprint as { fingerprint: string }).fingerprint = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionLock as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionReadOnlyDerivedField as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.derivedSchemaFingerprint as { fingerprint: string }).fingerprint = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionEnvelope as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionAnchor as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionBeacon as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionSignature as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionDerivedSummary as { label: string }).label = "q"; }).toThrow();
    expect(() => { (telemetry.schemaVersionStability as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionVersionedField as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.versionedSchemaSnapshot as { schemaVersion: number }).schemaVersion = 99; }).toThrow();
    expect(() => { (telemetry.schemaVersionDescriptor as { label: string }).label = "y"; }).toThrow();
    expect(() => { (telemetry.derivedSchemaVersion as { label: string }).label = "z"; }).toThrow();
  });
});
