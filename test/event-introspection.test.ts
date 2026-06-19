import { describe, expect, test } from "bun:test";
import {
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata,
  schemaVersionFingerprint,
  schemaVersionHash,
  versionedSchemaVersion
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
    expect(metadata.schema.digest).toBe(`event-introspection#v${EVENT_INTROSPECTION_VERSION}`);
    expect(versioned.version).toBe(EVENT_INTROSPECTION_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(exportEventIntrospectionMetadata()).toBe(metadata);
    expect(schemaVersionFingerprint).toBe(`event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`);
    expect(schemaVersionHash).toBe(`event-introspection-hash@v${EVENT_INTROSPECTION_VERSION}`);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.fields)).toBe(true);
    expect(Object.isFrozen(metadata.schema)).toBe(true);
    expect(Object.isFrozen(metadata.publicShape)).toBe(true);
    expect(Object.isFrozen(metadata.versionedPublicShape)).toBe(true);
    expect(Object.isFrozen(metadata.versionedPublicShape.publicShape)).toBe(true);
    expect(Object.isFrozen(metadata.readonlyFields)).toBe(true);
    expect(Object.isFrozen(metadata.versionedSchemaVersion)).toBe(true);
    expect(Object.isFrozen(metadata.exportContract)).toBe(true);
    expect(metadata.schema).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      label: `event-introspection:v${EVENT_INTROSPECTION_VERSION}`,
      tag: `event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`,
      fingerprint: `event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`,
      digest: `event-introspection#v${EVENT_INTROSPECTION_VERSION}`
    });
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
        derivedFieldCount: 13,
        schemaVersionDigest: `event-introspection#v${EVENT_INTROSPECTION_VERSION}`,
        schemaVersionHash: `event-introspection-hash@v${EVENT_INTROSPECTION_VERSION}`,
        exportContractVersion: EVENT_INTROSPECTION_VERSION,
        introspectionMode: "static-readonly",
        schemaVersionLabel: `event-introspection:v${EVENT_INTROSPECTION_VERSION}`,
        schemaVersionTag: `event-introspection-schema@v${EVENT_INTROSPECTION_VERSION}`,
        schemaVersionFingerprint: `event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`,
        versionedSchemaVersion: EVENT_INTROSPECTION_VERSION
      }
    });
    expect(metadata.readonlyFields).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      schemaVersion: EVENT_INTROSPECTION_VERSION,
      derivedFieldCount: 13
    });
    expect(metadata.versionedSchemaVersion).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      readOnly: true,
      schemaVersion: EVENT_INTROSPECTION_VERSION,
      schemaVersionLabel: `event-introspection:v${EVENT_INTROSPECTION_VERSION}`,
      schemaVersionFingerprint: `event-introspection-schema-fingerprint@v${EVENT_INTROSPECTION_VERSION}`
    });
    expect(versionedSchemaVersion).toBe(metadata.versionedSchemaVersion);
    expect(metadata.fields).toContainEqual({ name: "versionedSchemaVersion", type: "number", description: "Versioned derived schema version marker that mirrors the facade version." });
    expect(metadata.fields).toContainEqual({ name: "schemaVersionHash", type: "string literal", description: "Versioned derived hash-like label that mirrors the schema digest for stability checks." });
    expect(() => { (metadata as { version: number }).version = 99; }).toThrow();
    expect(() => { (metadata.schema as { digest: string }).digest = "mutated"; }).toThrow();
    expect(() => { (metadata.publicShape as { stable: boolean }).stable = false; }).toThrow();
    expect(() => { (metadata.versionedPublicShape as { readOnly: boolean }).readOnly = false; }).toThrow();
    expect(() => { (metadata.readonlyFields as { derivedFieldCount: number }).derivedFieldCount = 1; }).toThrow();
    expect(() => { (metadata.versionedSchemaVersion as { readOnly: boolean }).readOnly = false; }).toThrow();
    expect(() => { (metadata.exportContract as { stable: boolean }).stable = false; }).toThrow();
  });
});
