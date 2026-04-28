import { describe, expect, test } from "bun:test";
import {
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata
} from "../src/event-introspection.ts";

describe("event introspection metadata", () => {
  test("exposes a versioned deeply immutable read-only facade", () => {
    const versioned = getVersionedEventIntrospectionMetadata();
    const metadata = exportEventIntrospectionMetadata();
    const firstField = metadata.fields[0]!;

    expect(versioned.version).toBe(EVENT_INTROSPECTION_VERSION);
    expect(versioned.readOnly).toBe(true);
    expect(versioned.metadata).toBe(metadata);
    expect(getEventIntrospectionMetadata()).toBe(metadata);
    expect(Object.isFrozen(versioned)).toBe(true);
    expect(Object.isFrozen(versioned.metadata)).toBe(true);
    expect(Object.isFrozen(versioned.metadata.fields)).toBe(true);
    expect(Object.isFrozen(firstField)).toBe(true);
    expect(versioned.metadata.domain).toBe("event-introspection");
    expect(firstField.name).toBe("version");

    expect(() => {
      (versioned as { version: number }).version = 2;
    }).toThrow();
    expect(() => {
      (versioned.metadata as { domain: string }).domain = "mutated";
    }).toThrow();
    expect(() => {
      (firstField as unknown as { name: string }).name = "mutated";
    }).toThrow();
  });
});
