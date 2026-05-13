import { describe, expect, test } from "bun:test";
import {
  TELEMETRY_VERSION,
  exportTelemetryMetadata,
  getTelemetryMetadata,
  getVersionedTelemetryMetadata
} from "../src/telemetry.ts";

describe("telemetry metadata", () => {
  test("exports a stable, immutable, versioned, visible summary", () => {
    const versioned = getVersionedTelemetryMetadata();
    const telemetry = versioned.telemetry;

    expect(TELEMETRY_VERSION).toBe(2);
    expect(versioned.version).toBe(TELEMETRY_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(telemetry.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.readOnly).toBe(true);
    expect(telemetry.derivedVersion).toBe(TELEMETRY_VERSION);
    expect(telemetry.exportVisibility.version).toBe(TELEMETRY_VERSION);
    expect(telemetry.exportVisibility.visible).toBe(true);
    expect(telemetry.exportVisibility.derived).toBe(true);
    expect(exportTelemetryMetadata()).toBe(telemetry);
    expect(getTelemetryMetadata()).toBe(telemetry);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(telemetry)).toBe(true);
    expect(Object.isFrozen(telemetry.fields)).toBe(true);
    expect(Object.isFrozen(telemetry.snapshot)).toBe(true);
    expect(Object.isFrozen(telemetry.derivedSignature)).toBe(true);
    expect(Object.isFrozen(telemetry.publicShape)).toBe(true);
    expect(Object.isFrozen(telemetry.exportVisibility)).toBe(true);
    expect(() => { (telemetry as { version: number }).version = 3; }).toThrow();
    expect(() => { (telemetry.exportVisibility as { visible: boolean }).visible = false; }).toThrow();
    expect(() => { (telemetry.publicShape as { stableShape: boolean }).stableShape = false; }).toThrow();
  });
});
