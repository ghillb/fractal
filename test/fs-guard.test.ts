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

  test("blocks writes to .env", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    expect(() => assertWithinWorkspace(root, ".env")).toThrow("Blocked path segment: .env");
  });

  test("blocks writes to .git config metadata", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    expect(() => assertWithinWorkspace(root, ".git/config")).toThrow(
      "Blocked path segment: .git"
    );
  });

  test("blocks writes to nested .env.keys self-state", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    expect(() => assertWithinWorkspace(root, "state/.env.keys/active.json")).toThrow(
      "Blocked path segment: .env"
    );
  });

  test("blocks writes to evolve journal path", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    expect(() => assertWithinWorkspace(root, "JOURNAL.md")).toThrow(
      "Blocked protected path: JOURNAL.md"
    );
  });

  test("detects compile-heavy keywords", () => {
    expect(isCompileHeavyTask("build rust toolchain")).toBe(true);
    expect(isCompileHeavyTask("edit README")).toBe(false);
  });
});
