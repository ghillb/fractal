import { describe, expect, test } from "bun:test";
import { capabilitySnapshot, cliCapabilitySnapshot } from "../src/capability-snapshot.ts";
import { rootCapabilityExport } from "../src/cli.ts";

describe("capability snapshot", () => {
  test("exports a versioned immutable aggregate of read-only entrypoints and validation hooks", () => {
    expect(capabilitySnapshot.version).toBe(1);
    expect(capabilitySnapshot.readOnly).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot)).toBe(true);
    expect(Object.isFrozen(capabilitySnapshot.validation)).toBe(true);
    expect(capabilitySnapshot.validation.summary).toBeTypeOf("function");
    expect(capabilitySnapshot.validation.descriptor).toBeTypeOf("function");
    expect(capabilitySnapshot.validation.registry).toBeTypeOf("object");
    expect(capabilitySnapshot.validation.registry.read).toBeTypeOf("function");
    expect(capabilitySnapshot.validation.journalBlock).toBeTypeOf("function");
    expect(cliCapabilitySnapshot).toBe(capabilitySnapshot);
    expect(rootCapabilityExport).toBe(capabilitySnapshot);

    const original = capabilitySnapshot.validation.registry;
    expect(() => {
      (capabilitySnapshot as { version: number }).version = 2;
    }).toThrow();
    expect(capabilitySnapshot.validation.registry).toBe(original);
  });
});
