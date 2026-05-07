import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata
} from "../src/telemetry.ts";
import {
  TELEMETRY_VERSION as TELEMETRY_VERSION_FROM_ROOT,
  exportTelemetryMetadata as exportTelemetryMetadataFromRoot,
  getTelemetryMetadata as getTelemetryMetadataFromRoot,
  getVersionedTelemetryMetadata as getVersionedTelemetryMetadataFromRoot
} from "../src/index.ts";

describe("telemetry metadata", () => {
  test("exposes a versioned deeply immutable facade across the entrypoint boundary", () => {
    const versioned = getVersionedTelemetryMetadata();
    const rootVersioned = getVersionedTelemetryMetadataFromRoot();
    const metadata = exportTelemetryMetadata();
    const rootMetadata = exportTelemetryMetadataFromRoot();

    expect(TELEMETRY_VERSION_FROM_ROOT).toBe(TELEMETRY_VERSION);
    expect(versioned.version).toBe(TELEMETRY_VERSION);
    expect(rootVersioned.version).toBe(TELEMETRY_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(rootVersioned.readOnly).toBe(true);
    expect(versioned.telemetry).toBe(metadata);
    expect(rootVersioned.telemetry).toBe(metadata);
    expect(getTelemetryMetadata()).toBe(metadata);
    expect(getTelemetryMetadataFromRoot()).toBe(metadata);
    expect(rootMetadata).toBe(metadata);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.telemetry)).toBe(true);
    expect(Object.isFrozen(versioned.telemetry.fields)).toBe(true);
    expect(Object.isFrozen(versioned.telemetry.snapshot)).toBe(true);
    expect(Object.isFrozen(versioned.telemetry.derivedSignature)).toBe(true);
    expect(Object.isFrozen(versioned.telemetry.publicShape)).toBe(true);
    expect(versioned.telemetry.domain).toBe("telemetry");
    expect(versioned.telemetry.derivedVersion).toBe(TELEMETRY_VERSION);
    expect(versioned.telemetry.snapshot).toEqual({
      version: TELEMETRY_VERSION,
      immutable: true,
      stableShape: true
    });
    expect(versioned.telemetry.derivedSignature).toEqual({
      version: TELEMETRY_VERSION,
      value: "telemetry@1",
      derived: true
    });
    expect(versioned.telemetry.publicShape).toEqual({
      version: TELEMETRY_VERSION,
      readOnly: true,
      domain: "telemetry",
      derivedVersion: TELEMETRY_VERSION,
      stableShape: true
    });
    expect(versioned.telemetry.fields.map((field) => field.name)).toEqual([
      "version",
      "readOnly",
      "domain",
      "derivedVersion",
      "fields",
      "snapshot",
      "derivedSignature",
      "publicShape"
    ]);
    expect(rootVersioned).toEqual(versioned);
    expect(Object.keys(rootVersioned)).toEqual(["version", "readOnly", "telemetry"]);

    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.telemetry as { domain: string }).domain = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.telemetry.snapshot as { immutable: boolean }).immutable = false;
    }).toThrow();
    expect(() => {
      (versioned.telemetry.derivedSignature as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.telemetry.publicShape as { domain: string }).domain = "mutated";
    }).toThrow();
  });
});
