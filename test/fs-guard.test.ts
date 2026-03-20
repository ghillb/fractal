import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertMutableWithinWorkspace,
  assertReadableWithinWorkspace,
  assertWithinWorkspace,
  assertWithinWorkspaceForAccess,
  PROTECTED_PATH_RULES,
  WorkspaceAccessMode,
  isCompileHeavyTask
} from "../src/core/fs-guard.ts";
import {
  FS_GUARD_PROTECTED_SEGMENT_CASES,
  FS_GUARD_PROTECTED_SELF_STATE_PATHS
} from "./fs-guard-path-fixtures.ts";
import { assertSourcesDoNotContainPatterns, collectTypeScriptFiles } from "./grep-policy-helper.ts";

const FS_GUARD_ALIAS_SCAN_ROOTS = ["src/core", "src/tools"] as const;
const FS_GUARD_ALIAS_SCAN_EXCLUDED_FILES = new Set(["src/core/fs-guard.ts"]);

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

  test("rejects every documented protected path for mutating access", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    expect(PROTECTED_PATH_RULES.paths.length).toBeGreaterThan(0);

    for (const blockedPath of PROTECTED_PATH_RULES.paths) {
      expect(() => assertMutableWithinWorkspace(root, blockedPath)).toThrow(
        `Blocked protected path: ${blockedPath}`
      );
    }
  });

  test("blocks repository self-state/config writes via file ops and guard constants stay audited", async () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    const sourceExpectations = collectTypeScriptFiles(
      ["src/core", "src/tools"],
      new Set(["src/core/fs-guard.ts"])
    ).map((file) => ({ file }));

    expect(PROTECTED_PATH_RULES.paths).toEqual(FS_GUARD_PROTECTED_SELF_STATE_PATHS);
    assertSourcesDoNotContainPatterns(
      sourceExpectations,
      FS_GUARD_PROTECTED_SELF_STATE_PATHS.map((path) => `\"${path}\"`)
    );

    const { writeFileTool } = await import("../src/tools/file-ops.ts");
    for (const blockedPath of FS_GUARD_PROTECTED_SELF_STATE_PATHS) {
      await expect(
        writeFileTool(
          { path: blockedPath, content: "mutated" },
          { workspaceRoot: root }
        )
      ).rejects.toThrow(`Blocked protected path: ${blockedPath}`);
    }
  });

  test("blocks sensitive segment cases for mutating access", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    for (const [segment, path] of FS_GUARD_PROTECTED_SEGMENT_CASES) {
      expect(PROTECTED_PATH_RULES.segments).toContain(segment);
      const expectedMessage = PROTECTED_PATH_RULES.paths.includes(path as (typeof PROTECTED_PATH_RULES.paths)[number])
        ? `Blocked protected path: ${path}`
        : `Blocked path segment: ${segment}`;
      expect(() => assertMutableWithinWorkspace(root, path)).toThrow(expectedMessage);
    }
  });

  test("documents nested protected segment precedence", () => {
    expect(PROTECTED_PATH_RULES.segments).toEqual([".git", ".env", ".env.keys"]);
  });

  test("readable helper allows protected reads while mutating helper blocks them", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    writeFileSync(join(root, ".env"), "KEY=value\n", "utf8");
    mkdirSync(join(root, ".env.keys"), { recursive: true });
    writeFileSync(join(root, ".env.keys", "active.json"), "{}", "utf8");
    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");
    mkdirSync(join(root, "src", "evolve"), { recursive: true });
    writeFileSync(join(root, "src", "evolve", "journal.ts"), "export {};", "utf8");
    writeFileSync(join(root, "README.md"), "docs", "utf8");

    for (const blockedPath of PROTECTED_PATH_RULES.paths) {
      expect(() => assertMutableWithinWorkspace(root, blockedPath)).toThrow(
        `Blocked protected path: ${blockedPath}`
      );
      const readablePath = assertReadableWithinWorkspace(root, blockedPath);
      expect(readablePath.endsWith(blockedPath)).toBe(true);
      const stats = statSync(readablePath);
      if (stats.isFile()) {
        expect(readFileSync(readablePath, "utf8").length).toBeGreaterThan(0);
      } else {
        expect(stats.isDirectory()).toBe(true);
      }
    }

    expect(assertMutableWithinWorkspace(root, "README.md").endsWith("README.md")).toBe(true);
  });

  test("access-mode enum dispatches to the matching helper", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");

    expect(assertWithinWorkspaceForAccess(root, "JOURNAL.md", WorkspaceAccessMode.Read)).toBe(
      assertReadableWithinWorkspace(root, "JOURNAL.md")
    );
    expect(() =>
      assertWithinWorkspaceForAccess(root, "JOURNAL.md", WorkspaceAccessMode.Mutate)
    ).toThrow("Blocked protected path: JOURNAL.md");
  });

  test("preferred access-mode names remain the supported path for current callers", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    writeFileSync(join(root, "README.md"), "docs", "utf8");
    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");

    expect(assertReadableWithinWorkspace(root, "README.md")).toBe(
      assertWithinWorkspaceForAccess(root, "README.md", WorkspaceAccessMode.Read)
    );
    expect(assertMutableWithinWorkspace(root, "README.md")).toBe(
      assertWithinWorkspaceForAccess(root, "README.md", WorkspaceAccessMode.Mutate)
    );
    expect(() =>
      assertWithinWorkspaceForAccess(root, "JOURNAL.md", WorkspaceAccessMode.Mutate)
    ).toThrow("Blocked protected path: JOURNAL.md");
  });

  test("repository consumer call sites avoid deprecated or ambiguous fs-guard access aliases", () => {
    const disallowedPatterns = [
      "assertWithinWorkspace(",
      "assertWithinWorkspaceForAccess(",
      "WorkspaceAccessMode.Read",
      "WorkspaceAccessMode.Mutate"
    ];
    const sourceExpectations = collectTypeScriptFiles(
      FS_GUARD_ALIAS_SCAN_ROOTS,
      FS_GUARD_ALIAS_SCAN_EXCLUDED_FILES
    ).map((file) => ({ file }));

    assertSourcesDoNotContainPatterns(sourceExpectations, disallowedPatterns);
  });

  test("legacy assertWithinWorkspace remains a deprecated mutating alias", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");

    expect(assertWithinWorkspace.toString()).toContain("assertMutableWithinWorkspace");
    expect(() => assertWithinWorkspace(root, "JOURNAL.md")).toThrow(
      "Blocked protected path: JOURNAL.md"
    );
  });

  test("legacy assertWithinWorkspace stays equivalent to the explicit mutating helper", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    writeFileSync(join(root, "README.md"), "docs", "utf8");

    expect(assertWithinWorkspace(root, "README.md")).toBe(
      assertMutableWithinWorkspace(root, "README.md")
    );
  });

  test("detects compile-heavy keywords", () => {
    expect(isCompileHeavyTask("build rust toolchain")).toBe(true);
    expect(isCompileHeavyTask("edit README")).toBe(false);
  });
});
