import { describe, expect, test } from "bun:test";
import {
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata,
  schemaVersionFingerprint
} from "../src/index.ts";

describe("event introspection metadata", () => {
  test("exposes a read-only derived public shape that stays immutable", () => {
    const metadata = getEventIntrospectionMetadata();
    const versioned = getVersionedEventIntrospectionMetadata();

    expect(EVENT_INTROSPECTION_VERSION).toBe(6);
    expect(metadata.version).toBe(EVENT_INTROSPECTION_VERSION);
    expect(metadata.readOnly).toBe(true);
    expect(metadata.derivedVersion).toBe(EVENT_INTROSPECTION_VERSION);
    expect(metadata.schemaVersion).toBe(EVENT_INTROSPECTION_VERSION);
    expect(versioned.version).toBe(EVENT_INTROSPECTION_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(exportEventIntrospectionMetadata()).toBe(metadata);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.fields)).toBe(true);
    expect(Object.isFrozen(metadata.publicShape)).toBe(true);
    expect(Object.isFrozen(metadata.versionedPublicShape)).toBe(true);
    expect(Object.isFrozen(metadata.versionedPublicShape.publicShape)).toBe(true);
    expect(Object.isFrozen(metadata.exportContract)).toBe(true);
    expect(metadata.versionedPublicShape).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      readOnly: true,
      publicShape: {
        version: EVENT_INTROSPECTION_VERSION,
        stable: true,
        derived: true,
        readOnly: true,
        domain: "event-introspection",
        derivedVersion: EVENT_INTROSPECTION_VERSION,
        schemaVersion: EVENT_INTROSPECTION_VERSION,
        derivedFieldCount: 11,
        schemaVersionDigest: `event-introspection#v${EVENT_INTROSPECTION_VERSION}`,
        exportContractVersion: EVENT_INTROSPECTION_VERSION,
        introspectionMode: "static-readonly",
        schemaVersionLabel: `event-introspection:v${EVENT_INTROSPECTION_VERSION}`,
        schemaVersionTag: `event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`,
        schemaVersionFingerprint: `event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`
      }
    });
    expect(metadata.publicShape).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      stable: true,
      derived: true,
      readOnly: true,
      domain: "event-introspection",
      derivedVersion: EVENT_INTROSPECTION_VERSION,
      schemaVersion: EVENT_INTROSPECTION_VERSION,
      derivedFieldCount: 11,
      schemaVersionDigest: `event-introspection#v${EVENT_INTROSPECTION_VERSION}`,
      exportContractVersion: EVENT_INTROSPECTION_VERSION,
      introspectionMode: "static-readonly",
      schemaVersionLabel: `event-introspection:v${EVENT_INTROSPECTION_VERSION}`,
      schemaVersionTag: `event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`,
      schemaVersionFingerprint: `event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`
    });
    expect(metadata.exportContract).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      stable: true,
      derived: true,
      readOnly: true,
      derivedVersion: EVENT_INTROSPECTION_VERSION,
      schemaVersion: EVENT_INTROSPECTION_VERSION
    });
    expect(metadata.fields).toContainEqual({
      name: "schemaVersion",
      type: "number",
      description: "Derived schema version tag for stability checks."
    });
    expect(metadata.fields).toContainEqual({
      name: "exportContractVersion",
      type: "number",
      description: "Derived export contract version for schema and export stability checks."
    });
    expect(metadata.fields).toContainEqual({
      name: "introspectionMode",
      type: "string literal",
      description: "Derived mode flag identifying the facade as a static read-only surface."
    });
    expect(metadata.fields).toContainEqual({
      name: "schemaVersionLabel",
      type: "string literal",
      description: "Versioned derived label that combines the domain with the schema version for stability checks."
    });
    expect(metadata.fields).toContainEqual({
      name: "schemaVersionTag",
      type: "string literal",
      description: "Versioned derived tag that combines the domain schema with the version for shallow immutability and stability checks."
    });
    expect(metadata.fields).toContainEqual({
      name: "schemaVersionFingerprint",
      type: "string literal",
      description: "Versioned derived fingerprint that locks the schema version to a shallowly immutable public digest."
    });
    expect(metadata.fields).toContainEqual({
      name: "schemaVersionDigest",
      type: "string literal",
      description: "Versioned derived digest for schema stability and shallow immutability checks."
    });
    expect(() => {
      (metadata as { version: number }).version = 99;
    }).toThrow();
    expect(() => {
      (metadata.publicShape as { stable: boolean }).stable = false;
    }).toThrow();
    expect(() => {
      (metadata.versionedPublicShape as { readOnly: boolean }).readOnly = false;
    }).toThrow();
    expect(() => {
      (metadata.exportContract as { stable: boolean }).stable = false;
    }).toThrow();
    expect(metadata.publicShape.introspectionMode).toBe("static-readonly");
    expect(metadata.publicShape.schemaVersionLabel).toBe(`event-introspection:v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.publicShape.schemaVersionTag).toBe(`event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.publicShape.schemaVersionFingerprint).toBe(`event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.publicShape.schemaVersionDigest).toBe(`event-introspection#v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.versionedPublicShape.publicShape.introspectionMode).toBe("static-readonly");
    expect(metadata.versionedPublicShape.publicShape.schemaVersionDigest).toBe(`event-introspection#v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.versionedPublicShape.publicShape.schemaVersionLabel).toBe(`event-introspection:v${EVENT_INTROSPECTION_VERSION}`);
    expect(metadata.versionedPublicShape.publicShape.schemaVersionTag).toBe(`event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`);
  });
});
