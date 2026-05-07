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
    expect(Object.isFrozen(versioned.metadata.status)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.summary)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.lineage)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.lineage.derivedFrom)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.surface)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.derivedSignature)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.fields)).toBe(true);
    expect(versioned.metadata.domain).toBe("diagnostics");
    expect(versioned.metadata.derivedVersion).toBe(DIAGNOSTICS_VERSION);
    expect(versioned.metadata.status).toEqual({
      version: DIAGNOSTICS_VERSION,
      immutable: true,
      derived: true
    });
    expect(versioned.metadata.summary).toEqual({
      version: DIAGNOSTICS_VERSION,
      label: "diagnostics",
      stable: true
    });
    expect(versioned.metadata.lineage).toEqual({
      version: DIAGNOSTICS_VERSION,
      source: "src/diagnostics.ts",
      derivedFrom: ["version", "readOnly", "domain", "derivedVersion", "status", "summary", "derivedSignature", "fields", "surface"]
    });
    expect(versioned.metadata.surface).toEqual({
      version: DIAGNOSTICS_VERSION,
      shape: "versioned-readonly-derived-facade",
      derived: true
    });
    expect(versioned.metadata.derivedSignature).toEqual({
      version: DIAGNOSTICS_VERSION,
      value: "diagnostics@3",
      derived: true
    });
    expect(versioned.metadata.fields.map((field) => field.name)).toEqual([
      "version",
      "readOnly",
      "domain",
      "derivedVersion",
      "status",
      "summary",
      "lineage",
      "surface",
      "derivedSignature",
      "fields"
    ]);
    expect(rootVersioned).toEqual(versioned);
    expect(Object.keys(rootVersioned)).toEqual(["version", "readOnly", "metadata"]);

    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata as { domain: string }).domain = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.metadata.status as { immutable: boolean }).immutable = false;
    }).toThrow();
    expect(() => {
      (versioned.metadata.lineage as { source: string }).source = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.metadata.surface as { shape: string }).shape = "mutated";
    }).toThrow();
    expect(() => {
      (versioned.metadata.derivedSignature as { value: string }).value = "mutated";
    }).toThrow();
  });
});
