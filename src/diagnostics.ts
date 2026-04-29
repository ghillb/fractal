export const DIAGNOSTICS_VERSION = 1 as const;

export type DiagnosticsField = Readonly<{
  name: string;
  type: string;
  description: string;
}>;

export type DiagnosticsMetadata = Readonly<{
  version: typeof DIAGNOSTICS_VERSION;
  readOnly: true;
  domain: "diagnostics";
  fields: ReadonlyArray<DiagnosticsField>;
}>;

const diagnosticsMetadata: DiagnosticsMetadata = Object.freeze({
  version: DIAGNOSTICS_VERSION,
  readOnly: true,
  domain: "diagnostics",
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
