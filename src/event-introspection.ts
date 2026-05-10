export const EVENT_INTROSPECTION_VERSION = 3 as const;

export type EventIntrospectionField = Readonly<{
  name: string;
  type: string;
  description: string;
}>;

export type EventIntrospectionMetadata = Readonly<{
  version: typeof EVENT_INTROSPECTION_VERSION;
  readOnly: true;
  domain: "event-introspection";
  derivedVersion: typeof EVENT_INTROSPECTION_VERSION;
  fields: ReadonlyArray<EventIntrospectionField>;
  publicShape: Readonly<{
    version: typeof EVENT_INTROSPECTION_VERSION;
    stable: true;
    derived: true;
    readOnly: true;
    domain: "event-introspection";
    derivedVersion: typeof EVENT_INTROSPECTION_VERSION;
  }>;
  versionedPublicShape: Readonly<{
    version: typeof EVENT_INTROSPECTION_VERSION;
    readOnly: true;
    publicShape: Readonly<{
      version: typeof EVENT_INTROSPECTION_VERSION;
      stable: true;
      derived: true;
      readOnly: true;
      domain: "event-introspection";
      derivedVersion: typeof EVENT_INTROSPECTION_VERSION;
    }>;
  }>;
}>;

const eventIntrospectionMetadata: EventIntrospectionMetadata = Object.freeze({
  version: EVENT_INTROSPECTION_VERSION,
  readOnly: true,
  domain: "event-introspection",
  derivedVersion: EVENT_INTROSPECTION_VERSION,
  fields: Object.freeze([
    Object.freeze({
      name: "version",
      type: "number",
      description: "Stable version tag for the introspection facade."
    }),
    Object.freeze({
      name: "readOnly",
      type: "boolean",
      description: "Signals that the facade is immutable and side-effect free."
    }),
    Object.freeze({
      name: "domain",
      type: "string",
      description: "Canonical domain label for event/introspection consumers."
    }),
    Object.freeze({
      name: "derivedVersion",
      type: "number",
      description: "Versioned derived field that mirrors the introspection facade version."
    }),
    Object.freeze({
      name: "fields",
      type: "readonly metadata[]",
      description: "Structured read-only descriptions of exported metadata fields."
    }),
    Object.freeze({
      name: "publicShape",
      type: "readonly derived shape",
      description: "Versioned derived summary of the public, stable metadata surface."
    }),
    Object.freeze({
      name: "versionedPublicShape",
      type: "readonly derived shape",
      description: "Versioned wrapper that exposes the public shape as an immutable boundary object."
    })
  ]),
  publicShape: Object.freeze({
    version: EVENT_INTROSPECTION_VERSION,
    stable: true,
    derived: true,
    readOnly: true,
    domain: "event-introspection",
    derivedVersion: EVENT_INTROSPECTION_VERSION
  }),
  versionedPublicShape: Object.freeze({
    version: EVENT_INTROSPECTION_VERSION,
    readOnly: true,
    publicShape: Object.freeze({
      version: EVENT_INTROSPECTION_VERSION,
      stable: true,
      derived: true,
      readOnly: true,
      domain: "event-introspection",
      derivedVersion: EVENT_INTROSPECTION_VERSION
    })
  })
});

export function exportEventIntrospectionMetadata(): EventIntrospectionMetadata {
  return eventIntrospectionMetadata;
}

export function getVersionedEventIntrospectionMetadata(): Readonly<{
  version: typeof EVENT_INTROSPECTION_VERSION;
  readOnly: true;
  metadata: EventIntrospectionMetadata;
}> {
  return Object.freeze({
    version: EVENT_INTROSPECTION_VERSION,
    readOnly: true,
    metadata: eventIntrospectionMetadata
  });
}

export function getEventIntrospectionMetadata(): EventIntrospectionMetadata {
  return eventIntrospectionMetadata;
}
