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
  telemetryContract: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "telemetry@4";
    readOnly: true;
    derived: true;
  }>;
  schemaVersionSnapshot: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    immutable: true;
    derived: true;
    stableShape: true;
  }>;
  versionedSchemaSnapshot: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  versionedSchemaSummary: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionContract: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "telemetry-schema-contract@4";
    schemaVersion: typeof TELEMETRY_VERSION;
    derived: true;
  }>;
  derivedSchemaVersion: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    label: "telemetry-schema-version@4";
    derived: true;
  }>;
  schemaVersionField: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "schemaVersion";
    derived: true;
  }>;
  schemaVersion: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: typeof TELEMETRY_VERSION;
    derived: true;
  }>;
  schemaVersionLabel: Readonly<{
    version: typeof TELEMETRY_VERSION;
    value: string;
    derived: true;
  }>;
  schemaVersionStamp: Readonly<{
    version: typeof TELEMETRY_VERSION;
    stamp: `telemetry-schema-stamp@${typeof TELEMETRY_VERSION}`;
    derived: true;
  }>;
  schemaVersionDescriptor: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "telemetry-schema-version@4";
    schemaVersion: typeof TELEMETRY_VERSION;
    derived: true;
  }>;
  derivedContractLabel: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "telemetry-contract@4";
    derived: true;
  }>;
  versionedSurface: Readonly<{
    version: typeof TELEMETRY_VERSION;
    readOnly: true;
    derived: true;
    shape: "telemetry-versioned-surface@4";
  }>;
  schemaVersionSurface: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionFingerprint: Readonly<{
    version: typeof TELEMETRY_VERSION;
    fingerprint: `telemetry-schema-fingerprint@${typeof TELEMETRY_VERSION}`;
    readOnly: true;
    derived: true;
  }>;
  schemaVersionLock: Readonly<{
    version: typeof TELEMETRY_VERSION;
    label: "telemetry-schema-lock@4";
    readOnly: true;
    derived: true;
  }>;
  schemaVersionEnvelope: Readonly<{
    version: typeof TELEMETRY_VERSION;
    schemaVersion: typeof TELEMETRY_VERSION;
    readOnly: true;
    derived: true;
    stableShape: true;
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
    Object.freeze({ name: "telemetryContract", type: "readonly contract marker", description: "Versioned derived contract marker for the public telemetry facade." }),
    Object.freeze({ name: "schemaVersionSnapshot", type: "readonly schema snapshot object", description: "Versioned derived snapshot that exposes the telemetry schema version through a shallowly immutable object." }),
    Object.freeze({ name: "versionedSchemaSnapshot", type: "readonly schema snapshot object", description: "Versioned derived snapshot for schema/version stability checks." }),
    Object.freeze({ name: "versionedSchemaSummary", type: "readonly schema summary object", description: "Versioned derived schema summary for version stability checks." }),
    Object.freeze({ name: "schemaVersionContract", type: "readonly schema-version contract", description: "Versioned derived field that combines the schema label with the version for public contract stability checks." }),
    Object.freeze({ name: "derivedSchemaVersion", type: "readonly schema version marker", description: "Versioned derived field that exposes the schema version as a stable public marker." }),
    Object.freeze({ name: "schemaVersion", type: "readonly version marker", description: "Versioned derived schema version marker for stability checks." }),
    Object.freeze({ name: "schemaVersionLabel", type: "readonly version label", description: "Versioned derived label for schema/version stability checks." }),
    Object.freeze({ name: "schemaVersionStamp", type: "readonly schema stamp", description: "Versioned derived stamp that is stable for public schema/version assertions." }),
    Object.freeze({ name: "derivedContractLabel", type: "readonly contract label", description: "Versioned derived contract label for schema/version stability checks." }),
    Object.freeze({ name: "versionedSurface", type: "readonly derived surface", description: "Versioned derived surface marker for schema/version stability checks." }),
    Object.freeze({ name: "schemaVersionField", type: "readonly schema-version marker", description: "Versioned derived field that exposes the schema version label for downstream tooling." }),
    Object.freeze({ name: "schemaVersionDescriptor", type: "readonly schema-version descriptor", description: "Versioned derived field that pairs the schema label with the numeric schema version for stability checks." }),
    Object.freeze({ name: "schemaVersionFingerprint", type: "readonly schema fingerprint", description: "Versioned derived field that provides a shallowly immutable fingerprint for schema/version stability checks." }),
    Object.freeze({ name: "schemaVersionLock", type: "readonly schema lock", description: "Versioned derived field that locks the telemetry schema contract to the current version." })
  ]),
  snapshot: Object.freeze({ version: TELEMETRY_VERSION, immutable: true, stableShape: true }),
  derivedVisibility: Object.freeze({ version: TELEMETRY_VERSION, label: "public-export-visible", derived: true }),
  derivedSignature: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry@4", derived: true }),
  publicShape: Object.freeze({ version: TELEMETRY_VERSION, readOnly: true, domain: "telemetry", derivedVersion: TELEMETRY_VERSION, stableShape: true }),
  exportVisibility: Object.freeze({ version: TELEMETRY_VERSION, visible: true, derived: true }),
  sourceFingerprint: Object.freeze({ version: TELEMETRY_VERSION, value: "src/telemetry.ts@4", derived: true }),
  derivedSurface: Object.freeze({ version: TELEMETRY_VERSION, shape: "versioned-readonly-derived-facade", derived: true }),
  schemaDigest: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry@4:14", derived: true }),
  telemetrySummary: Object.freeze({ version: TELEMETRY_VERSION, fieldCount: 21, derived: true }),
  telemetryContract: Object.freeze({ version: TELEMETRY_VERSION, label: "telemetry@4", readOnly: true, derived: true }),
  schemaVersionSnapshot: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, immutable: true, derived: true, stableShape: true }),
  versionedSchemaSnapshot: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, readOnly: true, derived: true, stableShape: true }),
  versionedSchemaSummary: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, readOnly: true, derived: true, stableShape: true }),
  schemaVersionContract: Object.freeze({ version: TELEMETRY_VERSION, label: "telemetry-schema-contract@4", schemaVersion: TELEMETRY_VERSION, derived: true }),
  derivedSchemaVersion: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, label: "telemetry-schema-version@4", derived: true }),
  schemaVersion: Object.freeze({ version: TELEMETRY_VERSION, value: TELEMETRY_VERSION, derived: true }),
  schemaVersionLabel: Object.freeze({ version: TELEMETRY_VERSION, value: "telemetry-schema@4", derived: true }),
  schemaVersionStamp: Object.freeze({ version: TELEMETRY_VERSION, stamp: "telemetry-schema-stamp@4", derived: true }),
  schemaVersionDescriptor: Object.freeze({ version: TELEMETRY_VERSION, label: "telemetry-schema-version@4", schemaVersion: TELEMETRY_VERSION, derived: true }),
  derivedContractLabel: Object.freeze({ version: TELEMETRY_VERSION, label: "telemetry-contract@4", derived: true }),
  versionedSurface: Object.freeze({ version: TELEMETRY_VERSION, readOnly: true, derived: true, shape: "telemetry-versioned-surface@4" }),
  schemaVersionSurface: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, readOnly: true, derived: true, stableShape: true }),
  schemaVersionFingerprint: Object.freeze({ version: TELEMETRY_VERSION, fingerprint: "telemetry-schema-fingerprint@4", readOnly: true, derived: true }),
  schemaVersionLock: Object.freeze({ version: TELEMETRY_VERSION, label: "telemetry-schema-lock@4", readOnly: true, derived: true }),
  schemaVersionEnvelope: Object.freeze({ version: TELEMETRY_VERSION, schemaVersion: TELEMETRY_VERSION, readOnly: true, derived: true, stableShape: true }),
  schemaVersionField: Object.freeze({ version: TELEMETRY_VERSION, label: "schemaVersion", derived: true })
});

export type VersionedTelemetryMetadata = Readonly<{
  version: typeof TELEMETRY_VERSION;
  readOnly: true;
  telemetry: TelemetryMetadata;
}>;

export function exportTelemetryMetadata(): TelemetryMetadata { return telemetryMetadata; }
export function getTelemetryMetadata(): TelemetryMetadata { return telemetryMetadata; }
export function getVersionedTelemetryMetadata(): VersionedTelemetryMetadata { return Object.freeze({ version: TELEMETRY_VERSION, readOnly: true, telemetry: telemetryMetadata }); }
export const versionedSchemaSummary = telemetryMetadata.versionedSchemaSummary;
export const telemetryContract = telemetryMetadata.telemetryContract;
export const schemaVersionSnapshot = telemetryMetadata.schemaVersionSnapshot;
export const versionedSchemaSnapshot = telemetryMetadata.versionedSchemaSnapshot;
export const schemaVersionContract = telemetryMetadata.schemaVersionContract;
export const schemaVersionStamp = telemetryMetadata.schemaVersionStamp;
export const schemaVersionSurface = telemetryMetadata.schemaVersionSurface;
export const schemaVersionFingerprint = telemetryMetadata.schemaVersionFingerprint;
export const schemaVersionLock = telemetryMetadata.schemaVersionLock;
export const schemaVersionEnvelope = telemetryMetadata.schemaVersionEnvelope;
