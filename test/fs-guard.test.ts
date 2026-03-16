import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertWithinWorkspace,
  PROTECTED_PATH_RULES,
  isCompileHeavyTask
} from "../src/core/fs-guard.ts";

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

  test("rejects every documented protected path for write access", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    expect(PROTECTED_PATH_RULES.paths.length).toBeGreaterThan(0);

    for (const blockedPath of PROTECTED_PATH_RULES.paths) {
      expect(() => assertWithinWorkspace(root, blockedPath)).toThrow(
        `Blocked protected path: ${blockedPath}`
      );
    }
  });

  test("blocks sensitive segment cases", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    const protectedCases = [
      [".git", ".git/config"],
      [".env", ".env"],
      [".env", "state/.env.keys/active.json"],
      [".env", ".env.keys/active.json"]
    ] as const;

    for (const [segment, path] of protectedCases) {
      expect(PROTECTED_PATH_RULES.segments).toContain(segment);
      expect(() => assertWithinWorkspace(root, path)).toThrow(
        `Blocked path segment: ${segment}`
      );
    }
  });

  test("documents nested protected segment precedence", () => {
    expect(PROTECTED_PATH_RULES.segments).toEqual([".git", ".env", ".env.keys"]);
  });

  test("rejects protected writes without blocking corresponding reads", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");
    mkdirSync(join(root, "src", "evolve"), { recursive: true });
    writeFileSync(join(root, "src", "evolve", "journal.ts"), "export {};", "utf8");
    writeFileSync(join(root, "README.md"), "docs", "utf8");

    for (const blockedPath of PROTECTED_PATH_RULES.paths) {
      expect(() => assertWithinWorkspace(root, blockedPath)).toThrow(
        `Blocked protected path: ${blockedPath}`
      );
      expect(readFileSync(join(root, blockedPath), "utf8").length).toBeGreaterThan(0);
    }

    expect(assertWithinWorkspace(root, "README.md").endsWith("README.md")).toBe(true);
  });

  test("detects compile-heavy keywords", () => {
    expect(isCompileHeavyTask("build rust toolchain")).toBe(true);
    expect(isCompileHeavyTask("edit README")).toBe(false);
  });
});
