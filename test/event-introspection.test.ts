import { describe, expect, test } from "bun:test";
import {
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata
} from "../src/index.ts";

describe("event introspection metadata", () => {
  test("exposes a read-only derived public shape that stays immutable", () => {
    const metadata = getEventIntrospectionMetadata();
    const versioned = getVersionedEventIntrospectionMetadata();

    expect(EVENT_INTROSPECTION_VERSION).toBe(4);
    expect(metadata.version).toBe(EVENT_INTROSPECTION_VERSION);
    expect(metadata.readOnly).toBe(true);
    expect(metadata.derivedVersion).toBe(EVENT_INTROSPECTION_VERSION);
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
        derivedFieldCount: 8
      }
    });
    expect(metadata.publicShape).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      stable: true,
      derived: true,
      readOnly: true,
      domain: "event-introspection",
      derivedVersion: EVENT_INTROSPECTION_VERSION,
      derivedFieldCount: 8
    });
    expect(metadata.exportContract).toEqual({
      version: EVENT_INTROSPECTION_VERSION,
      stable: true,
      derived: true,
      readOnly: true,
      derivedVersion: EVENT_INTROSPECTION_VERSION
    });
    expect(metadata.fields).toContainEqual({
      name: "derivedFieldCount",
      type: "number",
      description: "Derived count of fields exposed by the public metadata surface."
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
  });
});
