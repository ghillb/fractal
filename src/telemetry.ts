export const TELEMETRY_VERSION = 1 as const;

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
  }>;
}>;

const telemetryMetadata: TelemetryMetadata = Object.freeze({
  version: TELEMETRY_VERSION,
  readOnly: true,
  domain: "telemetry",
  derivedVersion: TELEMETRY_VERSION,
  fields: Object.freeze([
    Object.freeze({
      name: "version",
      type: "number",
      description: "Stable version tag for the telemetry facade."
    }),
    Object.freeze({
      name: "readOnly",
      type: "boolean",
      description: "Signals that the facade is immutable and side-effect free."
    }),
    Object.freeze({
      name: "domain",
      type: "string",
      description: "Canonical domain label for telemetry consumers."
    }),
    Object.freeze({
      name: "derivedVersion",
      type: "number",
      description: "Versioned derived field that mirrors the telemetry facade version."
    }),
    Object.freeze({
      name: "fields",
      type: "readonly metadata[]",
      description: "Structured read-only descriptions of exported telemetry fields."
    }),
    Object.freeze({
      name: "snapshot",
      type: "readonly derived summary object",
      description: "Versioned derived snapshot for consumers that need a stable shape guarantee."
    }),
    Object.freeze({
      name: "derivedSignature",
      type: "readonly signature object",
      description: "Versioned derived signature for consumers that need a stable fingerprint."
    }),
    Object.freeze({
      name: "publicShape",
      type: "readonly public-shape summary",
      description: "Versioned derived public shape summary for stable consumer assertions."
    })
  ]),
  snapshot: Object.freeze({
    version: TELEMETRY_VERSION,
    immutable: true,
    stableShape: true
  }),
  derivedSignature: Object.freeze({
    version: TELEMETRY_VERSION,
    value: "telemetry@1",
    derived: true
  }),
  publicShape: Object.freeze({
    version: TELEMETRY_VERSION,
    readOnly: true,
    domain: "telemetry",
    derivedVersion: TELEMETRY_VERSION
  })
});

export type VersionedTelemetryMetadata = Readonly<{
  version: typeof TELEMETRY_VERSION;
  readOnly: true;
  telemetry: TelemetryMetadata;
}>;

export function exportTelemetryMetadata(): TelemetryMetadata {
  return telemetryMetadata;
}

export function getTelemetryMetadata(): TelemetryMetadata {
  return telemetryMetadata;
}

export function getVersionedTelemetryMetadata(): VersionedTelemetryMetadata {
  return Object.freeze({
    version: TELEMETRY_VERSION,
    readOnly: true,
    telemetry: telemetryMetadata
  });
}
