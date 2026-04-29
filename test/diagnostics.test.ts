import { describe, expect, test } from "bun:test";
import {
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata
} from "../src/diagnostics.ts";

describe("diagnostics metadata", () => {
  test("exposes a versioned deeply immutable read-only facade", () => {
    const versioned = getVersionedDiagnosticsMetadata();
    const metadata = exportDiagnosticsMetadata();
    const firstField = metadata.fields[0]!;

    expect(versioned.version).toBe(DIAGNOSTICS_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(getDiagnosticsMetadata()).toBe(metadata);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.metadata)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.fields)).toBe(true);
    expect(Object.isFrozen(firstField)).toBe(true);
    expect(versioned.metadata.domain).toBe("diagnostics");
    expect(firstField.name).toBe("version");
    expect("fields" in versioned.metadata).toBe(true);

    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata as { domain: string }).domain = "mutated";
    }).toThrow();
    expect(() => {
      (firstField as unknown as { name: string }).name = "mutated";
    }).toThrow();
  });
});
