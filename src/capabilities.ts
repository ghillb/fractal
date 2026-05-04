export const CAPABILITIES_VERSION = 3 as const;

export type CapabilityField = Readonly<{
  name: string;
  type: string;
  description: string;
}>;

export type CapabilityCapability = Readonly<{
  version: typeof CAPABILITIES_VERSION;
  readOnly: true;
  derived: true;
  capability: Readonly<{
    version: typeof CAPABILITIES_VERSION;
    label: "capabilities";
    stable: true;
  }>;
  fields: ReadonlyArray<CapabilityField>;
  immutability: Readonly<{
    version: typeof CAPABILITIES_VERSION;
    frozen: true;
    stableShape: true;
  }>;
}>;

const capabilityCapability: CapabilityCapability = Object.freeze({
  version: CAPABILITIES_VERSION,
  readOnly: true,
  derived: true,
  capability: Object.freeze({
    version: CAPABILITIES_VERSION,
    label: "capabilities",
    stable: true
  }),
  fields: Object.freeze([
    Object.freeze({
      name: "version",
      type: "number",
      description: "Stable version tag for the capability facade."
    }),
    Object.freeze({
      name: "readOnly",
      type: "boolean",
      description: "Signals that the facade is immutable and side-effect free."
    }),
    Object.freeze({
      name: "derived",
      type: "boolean",
      description: "Signals that the capability object is derived from existing exports."
    }),
    Object.freeze({
      name: "capability",
      type: "readonly summary object",
      description: "Versioned derived summary label for the capability facade."
    }),
    Object.freeze({
      name: "fields",
      type: "readonly metadata[]",
      description: "Structured read-only descriptions of exported capability fields."
    }),
    Object.freeze({
      name: "immutability",
      type: "readonly derived summary object",
      description: "Versioned derived summary that encodes the facade's frozen public shape."
    })
  ]),
  immutability: Object.freeze({
    version: CAPABILITIES_VERSION,
    frozen: true,
    stableShape: true
  })
});

export type VersionedCapabilityCapability = Readonly<{
  version: typeof CAPABILITIES_VERSION;
  readOnly: true;
  capability: CapabilityCapability;
}>;

export function exportCapabilityCapability(): CapabilityCapability {
  return capabilityCapability;
}

export function getVersionedCapabilityCapability(): VersionedCapabilityCapability {
  return Object.freeze({
    version: CAPABILITIES_VERSION,
    readOnly: true,
    capability: capabilityCapability
  });
}
