import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { exec, type ExecResult } from "../core/shell.ts";
import { readRecentEvolveJournalSummary } from "./read-evolve-journal-summary.ts";

export type CandidateFitnessInput = {
  lane?: string;
  changedFiles: readonly string[];
  declaredTargetFiles: readonly string[];
  previousTargetSets: readonly (readonly string[])[];
  baselineTestExitCode: number;
  candidateValidationPassed: boolean;
  productionLineDelta: number;
};

export type CandidateFitnessResult = {
  passed: boolean;
  score: number;
  behavioralFiles: string[];
  reasons: string[];
};

export type CandidateReplayInput = {
  lane?: string;
  workspaceRoot: string;
  baselineRef: string;
  declaredTargetFiles: readonly string[];
  previousTargetSets: readonly (readonly string[])[];
};

export type CandidateReplayResult = CandidateFitnessResult & {
  changedFiles: string[];
  candidateTestExitCode: number;
  baselineTestExitCode: number;
  productionLineDelta: number;
};

type ReplayExecutor = (command: string, cwd?: string) => ExecResult;

const NON_BEHAVIORAL_SOURCE_FILES = new Set([
  "src/index.ts",
  "src/capabilities.ts",
  "src/capability-snapshot.ts",
  "src/diagnostics.ts",
  "src/event-introspection.ts",
  "src/lifecycle.ts",
  "src/repository-capability-surface.ts",
  "src/telemetry.ts"
]);

function normalizeFiles(files: readonly string[]): string[] {
  return [...new Set(files.map((file) => file.replace(/^\.\//, "").trim()).filter(Boolean))].sort();
}

function isProductionFile(file: string): boolean {
  return file.startsWith("src/") || file.startsWith(".github/workflows/") || file.startsWith("scripts/");
}

function isBehavioralFile(file: string): boolean {
  if (NON_BEHAVIORAL_SOURCE_FILES.has(file)) return false;
  return isProductionFile(file);
}

export function evaluateCandidateFitness(input: CandidateFitnessInput): CandidateFitnessResult {
  const changedFiles = normalizeFiles(input.changedFiles).filter(
    (file) => file !== "JOURNAL.md" && !file.startsWith(".fractal/")
  );
  const declaredTargetFiles = normalizeFiles(input.declaredTargetFiles);
  const behavioralFiles = changedFiles.filter(isBehavioralFile);
  const changedSignature = changedFiles.join("|");
  const isSimplification = input.lane === "simplify"
    && input.productionLineDelta < 0
    && changedFiles.some(isProductionFile);
  const reasons: string[] = [];

  if (!input.candidateValidationPassed) reasons.push("candidate validation failed");
  if (!isSimplification && input.baselineTestExitCode === 0) {
    reasons.push("changed tests also pass on the baseline");
  }
  if (!isSimplification && !changedFiles.some((file) => file.startsWith("test/") && file.endsWith(".test.ts"))) {
    reasons.push("candidate did not change a test");
  }
  if (changedFiles.join("|") !== declaredTargetFiles.join("|")) {
    reasons.push("changed files differ from declared target scope");
  }
  if (input.previousTargetSets.some((files) => normalizeFiles(files).join("|") === changedSignature)) {
    reasons.push("target set was used by a recent candidate");
  }
  if (!isSimplification && behavioralFiles.length === 0) reasons.push("candidate has no behavioral runtime change");
  if (input.lane === "simplify" && !isSimplification) reasons.push("simplification did not reduce production lines");
  if (input.productionLineDelta > 200) reasons.push("production growth exceeds 200 lines");

  const passed = reasons.length === 0;
  const score = !passed
    ? 0
    : isSimplification
      ? 1000 + Math.min(200, -input.productionLineDelta)
      : 1000
        - Math.max(0, input.productionLineDelta)
        - Math.max(0, behavioralFiles.length - 1) * 25;

  return { passed, score, behavioralFiles, reasons };
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function productionDelta(numstat: string): number {
  let delta = 0;
  for (const line of numstat.split("\n")) {
    const [added, deleted, file] = line.split("\t");
    if (!file || !isProductionFile(file)) continue;
    const addedLines = Number.parseInt(added ?? "0", 10);
    const deletedLines = Number.parseInt(deleted ?? "0", 10);
    if (Number.isFinite(addedLines) && Number.isFinite(deletedLines)) {
      delta += addedLines - deletedLines;
    }
  }
  return delta;
}

export function runCandidateReplay(
  input: CandidateReplayInput,
  executor: ReplayExecutor = exec
): CandidateReplayResult {
  const range = `${input.baselineRef}..HEAD`;
  const changedFiles = normalizeFiles(
    executor(`git diff --name-only ${quote(range)}`, input.workspaceRoot).stdout.split("\n")
  );
  const testFiles = changedFiles.filter((file) => file.startsWith("test/") && file.endsWith(".test.ts"));
  const testArguments = testFiles.map(quote).join(" ");
  const candidateTest = testFiles.length > 0
    ? executor(`bun test ${testArguments}`, input.workspaceRoot)
    : input.lane === "simplify"
      ? executor("bun test", input.workspaceRoot)
      : { code: 1, stdout: "", stderr: "candidate did not change a test" };
  const numstat = executor(`git diff --numstat ${quote(range)}`, input.workspaceRoot).stdout;
  const lineDelta = productionDelta(numstat);

  let baselineTest: ExecResult = { code: 1, stdout: "", stderr: "candidate did not change a test" };
  if (testFiles.length > 0) {
    const temporaryRoot = mkdtempSync(join(tmpdir(), "fractal-fitness-"));
    const baselineRoot = join(temporaryRoot, "baseline");
    const patchPath = join(temporaryRoot, "candidate-tests.patch");
    try {
      const addWorktree = executor(
        `git worktree add --detach ${quote(baselineRoot)} ${quote(input.baselineRef)}`,
        input.workspaceRoot
      );
      if (addWorktree.code !== 0) throw new Error(`could not create baseline worktree: ${addWorktree.stderr}`);

      const testPatch = executor(
        `git diff --binary ${quote(range)} -- ${testArguments}`,
        input.workspaceRoot
      );
      writeFileSync(patchPath, testPatch.stdout, "utf8");
      const applyPatch = executor(`git apply ${quote(patchPath)}`, baselineRoot);
      if (applyPatch.code !== 0) throw new Error(`could not apply candidate tests to baseline: ${applyPatch.stderr}`);
      baselineTest = executor(`bun test ${testArguments}`, baselineRoot);
    } finally {
      executor(`git worktree remove --force ${quote(baselineRoot)}`, input.workspaceRoot);
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  }

  const fitness = evaluateCandidateFitness({
    lane: input.lane,
    changedFiles,
    declaredTargetFiles: input.declaredTargetFiles,
    previousTargetSets: input.previousTargetSets,
    baselineTestExitCode: baselineTest.code,
    candidateValidationPassed: candidateTest.code === 0,
    productionLineDelta: lineDelta
  });

  return {
    ...fitness,
    changedFiles,
    candidateTestExitCode: candidateTest.code,
    baselineTestExitCode: baselineTest.code,
    productionLineDelta: lineDelta
  };
}

function flagValue(argv: readonly string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

export async function runFitnessCli(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const baselineRef = flagValue(argv, "--base")?.trim();
  if (!baselineRef) throw new Error("--base <commit> is required");

  const candidateName = process.env.FRACTAL_CANDIDATE_NAME?.trim() || "candidate";
  const outputPath = flagValue(argv, "--output")
    ?? `.fractal/artifacts/${candidateName}/fitness.json`;
  const entries = await readRecentEvolveJournalSummary(9);
  const latest = entries[0];
  if (!latest) throw new Error("candidate journal entry is required before fitness evaluation");

  const result = runCandidateReplay({
    lane: candidateName,
    workspaceRoot: process.cwd(),
    baselineRef,
    declaredTargetFiles: latest.targetFiles,
    previousTargetSets: entries.slice(1).map((entry) => entry.targetFiles)
  });

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(result, null, 2));
  return result.passed ? 0 : 1;
}

if (import.meta.main) {
  runFitnessCli()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
