import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readConfig } from "../core/config.ts";
import { exec, type ExecResult } from "../core/shell.ts";
import { spriteEphemeralWorkflow } from "../tools/sprites.ts";
import type { EvolutionDecision, ObserveData } from "./types.ts";
import type { RecentEvolveCycleSummary } from "./read-evolve-journal-summary.ts";

export type ValidationStage = "typecheck" | "lint" | "test" | "sprite";

export type ValidationCommandResult = ExecResult & {
  stage: ValidationStage;
  command: string;
  stdoutTail: string;
  stderrTail: string;
};

export type ValidationSuiteResult = {
  passed: boolean;
  failedStage?: ValidationStage;
  commandResults: ValidationCommandResult[];
};

export type DecisionPreflightResult =
  | { ok: true; targetSignature: string }
  | { ok: false; reason: string; targetSignature: string };

export type CommandExecutor = (cmd: string) => ExecResult;

const DIAGNOSTIC_TAIL_LINES = 80;
const REPAIR_DIFF_TAIL_CHARS = 12000;

function normalizeTargetPath(path: string): string {
  return path.replace(/^\.\//, "").trim();
}

function tailLines(text: string, limit = DIAGNOSTIC_TAIL_LINES): string {
  const lines = text.trimEnd().split("\n");
  return lines.slice(Math.max(0, lines.length - limit)).join("\n");
}

function withDiagnostics(
  stage: ValidationStage,
  command: string,
  result: ExecResult
): ValidationCommandResult {
  return {
    ...result,
    stage,
    command,
    stdoutTail: tailLines(result.stdout),
    stderrTail: tailLines(result.stderr)
  };
}

function isAllowedMissingTarget(path: string): boolean {
  return path.startsWith("test/") && path.endsWith(".ts");
}

export function buildTargetSignature(targetFiles: readonly string[]): string {
  return targetFiles
    .map((path) => normalizeTargetPath(path))
    .filter(Boolean)
    .sort()
    .join("|");
}

export function buildRecentFailedTargetSignatures(
  entries: readonly Pick<RecentEvolveCycleSummary, "outcome" | "targetFiles">[],
  limit = 5
): string[] {
  return Array.from(
    new Set(
      entries
        .filter((entry) => entry.outcome === "reverted")
        .slice(0, limit)
        .map((entry) => buildTargetSignature(entry.targetFiles))
        .filter(Boolean)
    )
  );
}

export function validateDecisionPreflight(
  decision: Pick<EvolutionDecision, "targetFiles">,
  observations: Pick<ObserveData, "recentFailedTargetSignatures">
): DecisionPreflightResult {
  const targetFiles = decision.targetFiles.map((path) => normalizeTargetPath(path)).filter(Boolean);
  const targetSignature = buildTargetSignature(targetFiles);

  if (targetFiles.length === 0) {
    return { ok: false, reason: "preflight rejected decision: targetFiles must name at least one file", targetSignature };
  }

  const repeatedFailure = observations.recentFailedTargetSignatures?.includes(targetSignature) ?? false;
  if (repeatedFailure) {
    return {
      ok: false,
      reason: `preflight rejected decision: target file set recently failed validation (${targetSignature})`,
      targetSignature
    };
  }

  const missingDisallowedTargets = targetFiles.filter(
    (path) => !existsSync(path) && !isAllowedMissingTarget(path)
  );
  if (missingDisallowedTargets.length > 0) {
    return {
      ok: false,
      reason: `preflight rejected decision: target files do not exist (${missingDisallowedTargets.join(", ")})`,
      targetSignature
    };
  }

  return { ok: true, targetSignature };
}

export function runLocalValidationSuite(executor: CommandExecutor = exec): ValidationSuiteResult {
  const commandResults: ValidationCommandResult[] = [];

  const typecheck = runTypecheckValidation(executor).commandResults[0];
  if (!typecheck) {
    throw new Error("typecheck validation did not produce a command result");
  }
  commandResults.push(typecheck);
  if (typecheck.code !== 0) {
    return { passed: false, failedStage: "typecheck", commandResults };
  }

  const lint = withDiagnostics("lint", "bun run lint", executor("bun run lint"));
  commandResults.push(lint);

  const test = withDiagnostics("test", "bun test", executor("bun test"));
  commandResults.push(test);

  if (lint.code !== 0) {
    return { passed: false, failedStage: "lint", commandResults };
  }

  if (test.code !== 0) {
    return { passed: false, failedStage: "test", commandResults };
  }

  return { passed: true, commandResults };
}

function runTypecheckValidation(executor: CommandExecutor = exec): ValidationSuiteResult {
  const typecheck = withDiagnostics("typecheck", "bun run typecheck", executor("bun run typecheck"));
  return {
    passed: typecheck.code === 0,
    failedStage: typecheck.code === 0 ? undefined : "typecheck",
    commandResults: [typecheck]
  };
}

async function runSpriteChecks(): Promise<ExecResult> {
  const cfg = readConfig();
  if (!cfg.spritesEnabled) {
    throw new Error("Compile-heavy evolve change requires Sprites. Set SPRITES_ENABLED=true.");
  }

  const outcome = await spriteEphemeralWorkflow(
    {
      name: cfg.spritesDefaultName,
      command: "bun run lint && bun test",
      checkpoint: true
    },
    {
      enabled: cfg.spritesEnabled,
      defaultName: cfg.spritesDefaultName,
      retries: 2,
      timeoutSeconds: 240
    }
  );

  const run = outcome.run as Partial<ExecResult> | undefined;
  return {
    code: Number(run?.code ?? 1),
    stdout: String(run?.stdout ?? ""),
    stderr: String(run?.stderr ?? "")
  };
}

export function buildSpriteValidationResult(
  typecheck: ValidationSuiteResult,
  spriteRun: ExecResult
): ValidationSuiteResult {
  if (!typecheck.passed) {
    return typecheck;
  }

  const spriteResult = withDiagnostics("sprite", "bun run lint && bun test", spriteRun);
  const spritePassed = spriteResult.code === 0;

  return {
    passed: spritePassed,
    failedStage: spritePassed ? undefined : "sprite",
    commandResults: [...typecheck.commandResults, spriteResult]
  };
}

export async function runValidationSuite(compileHeavy: boolean): Promise<ValidationSuiteResult> {
  if (!compileHeavy) {
    return runLocalValidationSuite();
  }

  const typecheck = runTypecheckValidation();
  if (!typecheck.passed) {
    return typecheck;
  }

  return buildSpriteValidationResult(typecheck, await runSpriteChecks());
}

export function compactValidationResult(result: ValidationSuiteResult): Record<string, unknown> {
  return {
    passed: result.passed,
    failedStage: result.failedStage,
    commandResults: result.commandResults.map((command) => ({
      stage: command.stage,
      command: command.command,
      code: command.code,
      stdoutTail: command.stdoutTail,
      stderrTail: command.stderrTail
    }))
  };
}

export function formatValidationFailureForPrompt(result: ValidationSuiteResult): string {
  const failed = result.commandResults.find((command) => command.stage === result.failedStage)
    ?? result.commandResults.find((command) => command.code !== 0);
  if (!failed) {
    return "Validation failed without command diagnostics.";
  }

  return [
    `Failed stage: ${failed.stage}`,
    `Command: ${failed.command}`,
    `Exit code: ${failed.code}`,
    failed.stdoutTail ? `stdout tail:\n${failed.stdoutTail}` : "",
    failed.stderrTail ? `stderr tail:\n${failed.stderrTail}` : ""
  ].filter(Boolean).join("\n");
}

export function buildRepairPrompt(
  decision: EvolutionDecision,
  validation: ValidationSuiteResult,
  changedFiles: string[],
  diff: string,
  attempt: number,
  maxAttempts: number
): string {
  return [
    "Repair the current repository diff so canonical validation passes.",
    `Chosen change: ${decision.chosenChange}`,
    `Repair attempt: ${attempt}/${maxAttempts}`,
    "Do not expand scope. Prefer the smallest fix to the current diff.",
    `Changed files: ${changedFiles.join(", ") || "none"}`,
    "Validation diagnostics:",
    formatValidationFailureForPrompt(validation),
    "Current diff:",
    diff.slice(-REPAIR_DIFF_TAIL_CHARS),
    "Before final response, run bun run typecheck, bun run lint, and bun test unless a compile-heavy path explicitly uses Sprites for lint/test."
  ].join("\n");
}

export function commitEvolution(change: string, executor: CommandExecutor = exec): void {
  if (!executor("git status --porcelain --untracked-files=all").stdout.trim()) {
    throw new Error("no file changes produced by evolve action");
  }

  executor("git add -A");
  const subject = change.replaceAll("\n", " ").slice(0, 72) || "automated improvement";
  const authorName = process.env.FRACTAL_GIT_AUTHOR_NAME ?? "fractal[bot]";
  const authorEmail = process.env.FRACTAL_GIT_AUTHOR_EMAIL ?? "fractal-bot@users.noreply.github.com";
  const result = executor(
    `git -c user.name=${JSON.stringify(authorName)} -c user.email=${JSON.stringify(authorEmail)} commit -m ${JSON.stringify(`evolve(agent): ${subject}`)}`
  );
  if (result.code !== 0) {
    const details = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join(" | ");
    throw new Error(`commit failed: ${details}`);
  }
}

export function artifactRootForCycle(runId: number): string {
  const candidateName = process.env.FRACTAL_CANDIDATE_NAME?.trim();
  return `.fractal/artifacts/${candidateName || `evolve-${runId}`}`;
}

export function writeValidationArtifacts(
  artifactRoot: string,
  attempt: number,
  result: ValidationSuiteResult
): void {
  mkdirSync(artifactRoot, { recursive: true });
  writeFileSync(
    join(artifactRoot, `validation-attempt-${attempt}.json`),
    `${JSON.stringify(compactValidationResult(result), null, 2)}\n`,
    "utf8"
  );

  for (const command of result.commandResults) {
    writeFileSync(join(artifactRoot, `validation-attempt-${attempt}-${command.stage}.stdout.log`), command.stdout, "utf8");
    writeFileSync(join(artifactRoot, `validation-attempt-${attempt}-${command.stage}.stderr.log`), command.stderr, "utf8");
  }
}

export function writeCandidatePatch(
  artifactRoot: string,
  filename = "candidate-before-revert.patch",
  executor: CommandExecutor = exec
): string {
  mkdirSync(artifactRoot, { recursive: true });
  executor("git add -N -- . ':(exclude).fractal' >/dev/null 2>&1 || true");
  const diff = executor("git diff --binary HEAD -- . ':(exclude).fractal'");
  const patchPath = join(artifactRoot, filename);
  writeFileSync(patchPath, diff.stdout, "utf8");
  return patchPath;
}
