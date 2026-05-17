import { describe, expect, test } from "bun:test";
import {
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata
} from "../src/diagnostics.ts";
import {
  exportDiagnosticsMetadata as exportDiagnosticsMetadataFromIndex,
  getVersionedDiagnosticsMetadata as getVersionedDiagnosticsMetadataFromIndex
} from "../src/index.ts";

describe("diagnostics metadata", () => {
  test("exports a versioned immutable derived field with stable shape", () => {
    const metadata = exportDiagnosticsMetadata();
    const versioned = getVersionedDiagnosticsMetadata();

    expect(DIAGNOSTICS_VERSION).toBe(3);
    expect(metadata.version).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.readOnly).toBe(true);
    expect(metadata.derivedVersion).toBe(DIAGNOSTICS_VERSION);
    expect(metadata.lineage.derivedFrom).toContain("lineage");
    expect(metadata.publicShape.stableShape).toBe(true);
    expect(metadata.publicShapeSignature.value).toBe("diagnostics:public-shape@3");
    expect(metadata.derivedSignature.value).toBe("diagnostics@3");
    expect(metadata.exportContract.value).toBe("diagnostics:export-contract@3");
    expect(metadata.fields.map((field) => field.name)).toContain("exportContract");
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.status)).toBe(true);
    expect(Object.isFrozen(metadata.summary)).toBe(true);
    expect(Object.isFrozen(metadata.lineage)).toBe(true);
    expect(Object.isFrozen(metadata.surface)).toBe(true);
    expect(Object.isFrozen(metadata.publicShape)).toBe(true);
    expect(Object.isFrozen(metadata.publicShapeSignature)).toBe(true);
    expect(Object.isFrozen(metadata.derivedSignature)).toBe(true);
    expect(Object.isFrozen(metadata.exportContract)).toBe(true);
    expect(getDiagnosticsMetadata()).toBe(metadata);
    expect(exportDiagnosticsMetadataFromIndex()).toBe(metadata);
    expect(versioned.metadata).toBe(metadata);
    expect(getVersionedDiagnosticsMetadataFromIndex().metadata).toBe(metadata);
    expect(Object.isFrozen(versioned)).toBe(true);

    expect(() => {
      (metadata as { derivedVersion: number }).derivedVersion = 2;
    }).toThrow();
    expect(() => {
      (metadata.lineage as { source: string }).source = "mutated";
    }).toThrow();
    expect(() => {
      (metadata.publicShape as { stableShape: boolean }).stableShape = false;
    }).toThrow();
    expect(() => {
      (metadata.publicShapeSignature as { value: string }).value = "mutated";
    }).toThrow();
    expect(() => {
      (metadata.exportContract as { value: string }).value = "mutated";
    }).toThrow();
  });
});
