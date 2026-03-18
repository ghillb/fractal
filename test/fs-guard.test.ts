import { describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

  test("blocks sensitive segment cases for mutating access", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));
    const protectedCases = [
      [".git", ".git/config"],
      [".env", ".env"],
      [".env", "state/.env.keys/active.json"],
      [".env", ".env.keys/active.json"]
    ] as const;

    for (const [segment, path] of protectedCases) {
      expect(PROTECTED_PATH_RULES.segments).toContain(segment);
      expect(() => assertMutableWithinWorkspace(root, path)).toThrow(
        `Blocked path segment: ${segment}`
      );
    }
  });

  test("documents nested protected segment precedence", () => {
    expect(PROTECTED_PATH_RULES.segments).toEqual([".git", ".env", ".env.keys"]);
  });

  test("readable helper allows protected reads while mutating helper blocks them", () => {
    const root = mkdtempSync(join(tmpdir(), "fractal-test-"));

    writeFileSync(join(root, "JOURNAL.md"), "journal", "utf8");
    mkdirSync(join(root, "src", "evolve"), { recursive: true });
    writeFileSync(join(root, "src", "evolve", "journal.ts"), "export {};", "utf8");
    writeFileSync(join(root, "README.md"), "docs", "utf8");

    for (const blockedPath of PROTECTED_PATH_RULES.paths) {
      expect(() => assertMutableWithinWorkspace(root, blockedPath)).toThrow(
        `Blocked protected path: ${blockedPath}`
      );
      expect(assertReadableWithinWorkspace(root, blockedPath).endsWith(blockedPath)).toBe(true);
      expect(readFileSync(join(root, blockedPath), "utf8").length).toBeGreaterThan(0);
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
    const sourceExpectations = [
      {
        file: "src/core/shell.ts",
        // Excluded: src/core/fs-guard.ts defines the legacy/exported compatibility surface on purpose.
        allowedPatterns: []
      },
      {
        file: "src/core/config.ts",
        // Excluded: files outside current source consumer directories (for example tests, docs, and scripts)
        // are intentionally ignored here to keep this regression guard focused on production callers.
        allowedPatterns: []
      },
      {
        file: "src/core/http.ts",
        allowedPatterns: []
      },
      {
        file: "src/core/logger.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/file-ops.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/command.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/fetch-url.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/hackernews.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/index.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/sprites.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/types.ts",
        allowedPatterns: []
      },
      {
        file: "src/tools/web-search.ts",
        allowedPatterns: []
      }
    ];

    for (const { file, allowedPatterns } of sourceExpectations) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      const sanitized = allowedPatterns.reduce(
        (currentSource, allowedPattern) => currentSource.replaceAll(allowedPattern, ""),
        source
      );

      for (const pattern of disallowedPatterns) {
        expect(sanitized).not.toContain(pattern);
      }
    }
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
