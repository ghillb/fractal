export const TELEMETRY_VERSION = 4 as const;

export type TelemetryField = Readonly<{
  name: string;
  type: string;
  description: string;
}>;

export type TelemetryMetadata = Readonly<{
  version: typeof TELEMETRY_VERSION;
  readOnly: true;
  domain: "telemetry";
  derivedVersion: typeof TELEMETRY_VERSION;
  fields: ReadonlyArray<TelemetryField>;
  derivedVisibility: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "public-export-visible";
    derived: true;
  }>;
  snapshot: Readonly<{
    version: typeof TELEMETRY_VERSION;
    immutable: true;
    stableShape: true;
  }>;
  derivedSignature: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: string;
    derived: true;
  }>;
  publicShape: Readonly<{
    version: typeof TELEMETRY_VERSION;
    readOnly: true;
    domain: "telemetry";
    derivedVersion: typeof TELEMETRY_VERSION;
    stableShape: true;
  }>;
  exportVisibility: Readonly<{
    version: typeof TELEMETRY_VERSION;
    visible: true;
    derived: true;
  }>;
  sourceFingerprint: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: string;
    derived: true;
  }>;
  derivedSurface: Readonly<{
    version: typeof TELEMETRY_VERSION;
    shape: "versioned-readonly-derived-facade";
    derived: true;
  }>;
  schemaDigest: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: string;
    derived: true;
  }>;
  telemetrySummary: Readonly<{
    version: typeof TELEMETRY_VERSION;
    fieldCount: number;
    derived: true;
  }>;
  schemaVersionLabel: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: string;
    derived: true;
  }>;
}>;

const telemetryMetadata: TelemetryMetadata = Object.freeze({
  version: TELEMETRY_VERSION,
  readOnly: true,
  domain: "telemetry",
  derivedVersion: TELEMETRY_VERSION,
  fields: Object.freeze([
    Object.freeze({ name: "version", type: "number", description: "Stable version tag for the telemetry facade." }),
    Object.freeze({ name: "readOnly", type: "boolean", description: "Signals that the facade is immutable and side-effect free." }),
    Object.freeze({ name: "domain", type: "string", description: "Canonical domain label for telemetry consumers." }),
    Object.freeze({ name: "derivedVersion", type: "number", description: "Versioned derived field that mirrors the telemetry facade version." }),
    Object.freeze({ name: "fields", type: "readonly metadata[]", description: "Structured read-only descriptions of exported telemetry fields." }),
    Object.freeze({ name: "derivedVisibility", type: "readonly visibility object", description: "Versioned derived visibility marker for the public export surface." }),
    Object.freeze({ name: "snapshot", type: "readonly derived summary object", description: "Versioned derived snapshot for consumers that need a stable shape guarantee." }),
    Object.freeze({ name: "derivedSignature", type: "readonly signature object", description: "Versioned derived signature for consumers that need a stable fingerprint." }),
    Object.freeze({ name: "publicShape", type: "readonly public-shape summary", description: "Versioned derived public shape summary for stable consumer assertions." }),
    Object.freeze({ name: "exportVisibility", type: "readonly export-visibility summary", description: "Versioned derived visibility summary for public export checks." }),
    Object.freeze({ name: "sourceFingerprint", type: "readonly fingerprint object", description: "Versioned derived fingerprint for source-traceable telemetry exports." }),
    Object.freeze({ name: "derivedSurface", type: "readonly derived surface object", description: "Versioned derived surface descriptor for stable export introspection." }),
    Object.freeze({ name: "schemaDigest", type: "readonly schema digest", description: "Versioned derived digest for schema and version stability checks." }),
    Object.freeze({ name: "telemetrySummary", type: "readonly summary object", description: "Versioned derived summary of exported telemetry fields." }),
    Object.freeze({ name: "schemaVersionLabel", type: "readonly version label", description: "Versioned derived label for schema/version stability checks." })
  ]),
  snapshot: Object.freeze({ version: TELEMETRY_VERSION, immutable: true, stableShape: true }),
  derivedVisibility: Object.freeze({ version: TELEMETRY_VERSION, label: "public-export-visible", derived: true }),
  derivedSignature: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry@4", derived: true }),
  publicShape: Object.freeze({ version: TELEMETRY_VERSION, readOnly: true, domain: "telemetry", derivedVersion: TELEMETRY_VERSION, stableShape: true }),
  exportVisibility: Object.freeze({ version: TELEMETRY_VERSION, visible: true, derived: true }),
  sourceFingerprint: Object.freeze({ version: TELEMETRY_VERSION, value: "src/telemetry.ts@4", derived: true }),
  derivedSurface: Object.freeze({ version: TELEMETRY_VERSION, shape: "versioned-readonly-derived-facade", derived: true }),
  schemaDigest: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry@4:13", derived: true }),
  telemetrySummary: Object.freeze({ version: TELEMETRY_VERSION, fieldCount: 15, derived: true }),
  schemaVersionLabel: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry-schema@4", derived: true })
});

export type VersionedTelemetryMetadata = Readonly<{
  version: typeof TELEMETRY_VERSION;
  readOnly: true;
  telemetry: TelemetryMetadata;
}>;

export function exportTelemetryMetadata(): TelemetryMetadata { return telemetryMetadata; }
export function getTelemetryMetadata(): TelemetryMetadata { return telemetryMetadata; }
export function getVersionedTelemetryMetadata(): VersionedTelemetryMetadata { return Object.freeze({ version: TELEMETRY_VERSION, readOnly: true, telemetry: telemetryMetadata }); }
