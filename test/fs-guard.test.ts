import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertWithinWorkspace, isCompileHeavyTask } from "../src/core/fs-guard.ts";

describe("fs-guard", () => {
  test("allows files inside workspace", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, "src", "a.ts"), "x", "utf8");

    const resolved = assertWithinWorkspace(root, "src/a.ts");
    expect(resolved.endsWith("src/a.ts")).toBe(true);
  });

  test("blocks path escape", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    expect(() => assertWithinWorkspace(root, "../outside.txt")).toThrow();
  });

  test("detects compile-heavy keywords", () => {
    expect(isCompileHeavyTask("build rust toolchain")).toBe(true);
    expect(isCompileHeavyTask("edit README")).toBe(false);
  });
});