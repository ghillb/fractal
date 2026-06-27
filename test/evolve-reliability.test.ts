import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildRecentFailedTargetSignatures,
  buildRepairPrompt,
  buildSpriteValidationResult,
  buildTargetSignature,
  runLocalValidationSuite,
  validateDecisionPreflight,
  writeCandidatePatch
} from "../src/evolve/reliability.ts";

describe("evolve reliability controls", () => {
  test("builds stable target signatures independent of order", () => {
    expect(buildTargetSignature(["./test/b.test.ts", "src/a.ts"])).toBe("src/a.ts|test/b.test.ts");
  });

  test("preflight rejects repeated failed target sets", () => {
    const result = validateDecisionPreflight(
      { targetFiles: ["test/b.test.ts", "src/a.ts"] },
      { recentFailedTargetSignatures: ["src/a.ts|test/b.test.ts"] }
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("recently failed validation");
    }
  });

  test("preflight allows new test files but rejects missing source files", () => {
    const allowed = validateDecisionPreflight(
      { targetFiles: ["test/new-reliability.test.ts"] },
      { recentFailedTargetSignatures: [] }
    );
    const rejected = validateDecisionPreflight(
      { targetFiles: ["src/not-real.ts", "test/new-reliability.test.ts"] },
      { recentFailedTargetSignatures: [] }
    );

    expect(allowed.ok).toBe(true);
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.reason).toContain("src/not-real.ts");
    }
  });

  test("summarizes the last five reverted target signatures", () => {
    expect(
      buildRecentFailedTargetSignatures([
        { outcome: "reverted", targetFiles: ["src/f.ts"] },
        { outcome: "committed", targetFiles: ["src/ok.ts"] },
        { outcome: "reverted", targetFiles: ["src/e.ts"] },
        { outcome: "reverted", targetFiles: ["src/d.ts"] },
        { outcome: "reverted", targetFiles: ["src/c.ts"] },
        { outcome: "reverted", targetFiles: ["src/b.ts"] },
        { outcome: "reverted", targetFiles: ["src/a.ts"] }
      ])
    ).toEqual(["src/f.ts", "src/e.ts", "src/d.ts", "src/c.ts", "src/b.ts"]);
  });

  test("validation stops at typecheck and keeps diagnostics", () => {
    const result = runLocalValidationSuite((cmd) => ({
      code: cmd === "bun run typecheck" ? 1 : 0,
      stdout: "line 1\nline 2",
      stderr: "type error"
    }));

    expect(result.passed).toBe(false);
    expect(result.failedStage).toBe("typecheck");
    expect(result.commandResults).toHaveLength(1);
    expect(result.commandResults[0]?.stderrTail).toBe("type error");
  });

  test("repair prompt includes diagnostics and bounded attempt count", () => {
    const prompt = buildRepairPrompt(
      {
        diagnosis: "diagnosis",
        chosenChange: "change",
        rationale: "rationale",
        uncertainty: 0.2,
        executionMode: "implement",
        compileHeavy: false,
        targetFiles: ["src/evolve/cycle.ts"],
        nextCyclePlan: [],
        followUps: []
      },
      {
        passed: false,
        failedStage: "lint",
        commandResults: [
          {
            stage: "lint",
            command: "bun run lint",
            code: 1,
            stdout: "",
            stderr: "lint failed",
            stdoutTail: "",
            stderrTail: "lint failed"
          }
        ]
      },
      ["src/evolve/cycle.ts"],
      "diff --git a/src/evolve/cycle.ts b/src/evolve/cycle.ts",
      1,
      2
    );

    expect(prompt).toContain("Repair attempt: 1/2");
    expect(prompt).toContain("Failed stage: lint");
    expect(prompt).toContain("lint failed");
  });

  test("sprite validation preserves remote stdout and stderr diagnostics", () => {
    const result = buildSpriteValidationResult(
      {
        passed: true,
        commandResults: [
          {
            stage: "typecheck",
            command: "bun run typecheck",
            code: 0,
            stdout: "",
            stderr: "",
            stdoutTail: "",
            stderrTail: ""
          }
        ]
      },
      {
        code: 1,
        stdout: "remote lint stdout",
        stderr: "remote test stderr"
      }
    );

    expect(result.passed).toBe(false);
    expect(result.failedStage).toBe("sprite");
    expect(result.commandResults.at(-1)?.stdoutTail).toBe("remote lint stdout");
    expect(result.commandResults.at(-1)?.stderrTail).toBe("remote test stderr");
  });

  test("candidate patch captures staged and unstaged changes against HEAD", async () => {
    const artifactRoot = await mkdtemp(join(tmpdir(), "fractal-candidate-"));
    const commands: string[] = [];
    try {
      const patchPath = writeCandidatePatch(artifactRoot, "candidate.patch", (cmd) => {
        commands.push(cmd);
        return {
          code: 0,
          stdout: cmd.startsWith("git diff") ? "diff --git a/staged.ts b/staged.ts\n" : "",
          stderr: ""
        };
      });

      expect(commands).toContain("git diff --binary HEAD -- . ':(exclude).fractal'");
      expect(await readFile(patchPath, "utf8")).toContain("staged.ts");
    } finally {
      await rm(artifactRoot, { recursive: true, force: true });
    }
  });
});
