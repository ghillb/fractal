export const DIAGNOSTICS_VERSION = 2 as const;

export type DiagnosticsField = Readonly<{
  name: string;
  type: string;
  description: string;
}>;

export type DiagnosticsMetadata = Readonly<{
  version: typeof DIAGNOSTICS_VERSION;
  readOnly: true;
  domain: "diagnostics";
  derivedVersion: typeof DIAGNOSTICS_VERSION;
  status: Readonly<{
    version: typeof DIAGNOSTICS_VERSION;
    immutable: true;
    derived: true;
  }>;
  summary: Readonly<{
    version: typeof DIAGNOSTICS_VERSION;
    label: string;
    stable: true;
  }>;
  lineage: Readonly<{
    version: typeof DIAGNOSTICS_VERSION;
    source: "src/diagnostics.ts";
    derivedFrom: ReadonlyArray<"version" | "readOnly" | "domain" | "derivedVersion" | "status" | "summary" | "fields">;
  }>;
  fields: ReadonlyArray<DiagnosticsField>;
}>;

const diagnosticsMetadata: DiagnosticsMetadata = Object.freeze({
  version: DIAGNOSTICS_VERSION,
  readOnly: true,
  domain: "diagnostics",
  derivedVersion: DIAGNOSTICS_VERSION,
  status: Object.freeze({
    version: DIAGNOSTICS_VERSION,
    immutable: true,
    derived: true
  }),
  summary: Object.freeze({
    version: DIAGNOSTICS_VERSION,
    label: "diagnostics",
    stable: true
  }),
  lineage: Object.freeze({
    version: DIAGNOSTICS_VERSION,
    source: "src/diagnostics.ts",
    derivedFrom: Object.freeze(["version", "readOnly", "domain", "derivedVersion", "status", "summary", "fields"] as const)
  }),
  fields: Object.freeze([
    Object.freeze({
      name: "version",
      type: "number",
      description: "Stable version tag for the diagnostics facade."
    }),
    Object.freeze({
      name: "readOnly",
      type: "boolean",
      description: "Signals that the facade is immutable and side-effect free."
    }),
    Object.freeze({
      name: "domain",
      type: "string",
      description: "Canonical domain label for diagnostics consumers."
    }),
    Object.freeze({
      name: "derivedVersion",
      type: "number",
      description: "Versioned derived field that mirrors the diagnostics facade version."
    }),
    Object.freeze({
      name: "status",
      type: "readonly status object",
      description: "Versioned derived status summary for diagnostics consumers."
    }),
    Object.freeze({
      name: "summary",
      type: "readonly summary object",
      description: "Versioned derived summary label for diagnostics consumers."
    }),
    Object.freeze({
      name: "lineage",
      type: "readonly lineage object",
      description: "Versioned derived provenance for the diagnostics facade."
    }),
    Object.freeze({
      name: "fields",
      type: "readonly metadata[]",
      description: "Structured read-only descriptions of exported metadata fields."
    })
  ])
});

export type VersionedDiagnosticsMetadata = Readonly<{
  version: typeof DIAGNOSTICS_VERSION;
  readOnly: true;
  metadata: DiagnosticsMetadata;
}>;

export function exportDiagnosticsMetadata(): DiagnosticsMetadata {
  return diagnosticsMetadata;
}

export function getVersionedDiagnosticsMetadata(): VersionedDiagnosticsMetadata {
  return Object.freeze({
    version: DIAGNOSTICS_VERSION,
    readOnly: true,
    metadata: diagnosticsMetadata
  });
}

export function getDiagnosticsMetadata(): DiagnosticsMetadata {
  return diagnosticsMetadata;
}
