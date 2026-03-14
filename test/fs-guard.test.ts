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

  test("rejects writes to all documented protected high-sensitivity paths", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    const protectedCases = [
      { path: ".env", message: "Blocked path segment: .env" },
      { path: ".git/config", message: "Blocked path segment: .git" },
      { path: "state/.env.keys/active.json", message: "Blocked path segment: .env" },
      { path: ".env.keys/active.json", message: "Blocked path segment: .env" },
      { path: "JOURNAL.md", message: "Blocked protected path: JOURNAL.md" },
      {
        path: "src/evolve/journal.ts",
        message: "Blocked protected path: src/evolve/journal.ts"
      }
    ] as const;

    for (const { path, message } of protectedCases) {
      expect(() => assertWithinWorkspace(root, path)).toThrow(message);
    }
  });

  test("detects compile-heavy keywords", () => {
    expect(isCompileHeavyTask("build rust toolchain")).toBe(true);
    expect(isCompileHeavyTask("edit README")).toBe(false);
  });
});
