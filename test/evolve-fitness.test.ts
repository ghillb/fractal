import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exec } from "../src/core/shell.ts";
import { evaluateCandidateFitness, runCandidateReplay } from "../src/evolve/fitness.ts";

const temporaryRepositories: string[] = [];

afterEach(() => {
  for (const repository of temporaryRepositories.splice(0)) {
    rmSync(repository, { recursive: true, force: true });
  }
});

describe("evolve candidate fitness", () => {
  test("accepts a bounded behavioral mutation whose test fails on the baseline", () => {
    const result = evaluateCandidateFitness({
      changedFiles: ["src/tools/command.ts", "test/command.test.ts"],
      declaredTargetFiles: ["src/tools/command.ts", "test/command.test.ts"],
      previousTargetSets: [["src/evolve/cycle.ts", "test/evolve-cycle.test.ts"]],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 12
    });

    expect(result.passed).toBe(true);
    expect(result.behavioralFiles).toEqual(["src/tools/command.ts"]);
    expect(result.score).toBeGreaterThan(0);
  });

  test("rejects a mutation when its changed tests do not distinguish it from baseline", () => {
    const result = evaluateCandidateFitness({
      changedFiles: ["src/tools/command.ts", "test/command.test.ts"],
      declaredTargetFiles: ["src/tools/command.ts", "test/command.test.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 0,
      candidateValidationPassed: true,
      productionLineDelta: 4
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("changed tests also pass on the baseline");
  });

  test("rejects actual changes that drift outside the declared target scope", () => {
    const result = evaluateCandidateFitness({
      changedFiles: ["src/tools/command.ts", "src/agent/runner.ts", "test/command.test.ts"],
      declaredTargetFiles: ["src/tools/command.ts", "test/command.test.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 8
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("changed files differ from declared target scope");
  });

  test("rejects a recently repeated mutation target set", () => {
    const repeated = ["test/command.test.ts", "src/tools/command.ts"];
    const result = evaluateCandidateFitness({
      changedFiles: repeated,
      declaredTargetFiles: repeated,
      previousTargetSets: [["src/tools/command.ts", "test/command.test.ts"]],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 3
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("target set was used by a recent candidate");
  });

  test("rejects behavioral changes without a candidate-owned regression test", () => {
    const result = evaluateCandidateFitness({
      changedFiles: ["src/agent/runner.ts"],
      declaredTargetFiles: ["src/agent/runner.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 7
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("candidate did not change a test");
  });

  test("rejects large additive mutations that exceed the bounded-change budget", () => {
    const result = evaluateCandidateFitness({
      changedFiles: ["src/agent/runner.ts", "test/agent-runner.test.ts"],
      declaredTargetFiles: ["src/agent/runner.ts", "test/agent-runner.test.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 201
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("production growth exceeds 200 lines");
  });

  test("prefers the smaller behavioral mutation when validation evidence is equal", () => {
    const focused = evaluateCandidateFitness({
      changedFiles: ["src/tools/command.ts", "test/command.test.ts"],
      declaredTargetFiles: ["src/tools/command.ts", "test/command.test.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 8
    });
    const broad = evaluateCandidateFitness({
      changedFiles: ["src/tools/command.ts", "src/agent/runner.ts", "test/command.test.ts"],
      declaredTargetFiles: ["src/tools/command.ts", "src/agent/runner.ts", "test/command.test.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 1,
      candidateValidationPassed: true,
      productionLineDelta: 8
    });

    expect(focused.score).toBeGreaterThan(broad.score);
  });

  test("rewards a simplification lane that removes production code without regressions", () => {
    const result = evaluateCandidateFitness({
      lane: "simplify",
      changedFiles: ["src/repository-capability-surface.ts"],
      declaredTargetFiles: ["src/repository-capability-surface.ts"],
      previousTargetSets: [],
      baselineTestExitCode: 0,
      candidateValidationPassed: true,
      productionLineDelta: -40
    });

    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(1000);
  });

  test("does not count documentation-only deletion as production simplification", () => {
    const result = evaluateCandidateFitness({
      lane: "simplify",
      changedFiles: ["README.md"],
      declaredTargetFiles: ["README.md"],
      previousTargetSets: [],
      baselineTestExitCode: 0,
      candidateValidationPassed: true,
      productionLineDelta: -40
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain("simplification did not reduce production lines");
  });

  test("replays changed tests against the baseline before scoring the candidate", () => {
    const repository = mkdtempSync(join(tmpdir(), "fractal-fitness-repo-"));
    temporaryRepositories.push(repository);
    mkdirSync(join(repository, "src"));
    mkdirSync(join(repository, "test"));
    writeFileSync(join(repository, "src", "value.ts"), "export const value = 1;\n");
    writeFileSync(
      join(repository, "test", "value.test.ts"),
      'import { expect, test } from "bun:test";\nimport { value } from "../src/value.ts";\ntest("value", () => expect(value).toBe(1));\n'
    );
    exec("git init -q && git add . && git -c user.name=test -c user.email=test@example.com commit -qm baseline", repository);
    const baselineRef = exec("git rev-parse HEAD", repository).stdout.trim();

    writeFileSync(join(repository, "src", "value.ts"), "export const value = 2;\n");
    writeFileSync(
      join(repository, "test", "value.test.ts"),
      'import { expect, test } from "bun:test";\nimport { value } from "../src/value.ts";\ntest("value", () => expect(value).toBe(2));\n'
    );
    exec("git add . && git -c user.name=test -c user.email=test@example.com commit -qm candidate", repository);

    const result = runCandidateReplay({
      workspaceRoot: repository,
      baselineRef,
      declaredTargetFiles: ["src/value.ts", "test/value.test.ts"],
      previousTargetSets: []
    });

    expect(result.passed).toBe(true);
    expect(result.candidateTestExitCode).toBe(0);
    expect(result.baselineTestExitCode).not.toBe(0);
  }, 30_000);
});
