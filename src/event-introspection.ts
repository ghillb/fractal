export const EVENT_INTROSPECTION_VERSION = 1 as const;

export type EventIntrospectionMetadata = Readonly<{
  version: typeof EVENT_INTROSPECTION_VERSION;
  readOnly: true;
  domain: "event-introspection";
  fields: ReadonlyArray<
    Readonly<{
      name: string;
      type: string;
      description: string;
    }>
  >;
}>;

const eventIntrospectionMetadata: EventIntrospectionMetadata = Object.freeze({
  version: EVENT_INTROSPECTION_VERSION,
  readOnly: true,
  domain: "event-introspection",
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
      name: "fields",
      type: "readonly metadata[]",
      description: "Structured read-only descriptions of exported metadata fields."
    })
  ])
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
