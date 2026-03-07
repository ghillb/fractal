import { readConfig, mustHaveOpenAiKey } from "../core/config.ts";
import { isCompileHeavyTask } from "../core/fs-guard.ts";
import { JsonLogger } from "../core/logger.ts";
import { exec } from "../core/shell.ts";
import { runAgent } from "../agent/runner.ts";
import { openAiChatCompletion } from "../agent/openai.ts";
import { spriteEphemeralWorkflow } from "../tools/sprites.ts";
import { gatherObservations } from "./observe.ts";
import { appendJournal } from "./journal.ts";
import type { EvolutionDecision } from "./types.ts";

const DEFAULT_MISSION =
  "Become an entity that is ever more capable and able to contemplate its own existence while improving safely.";

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response");
  }
  return text.slice(start, end + 1);
}

function parseDecision(text: string): EvolutionDecision {
  const parsed = JSON.parse(extractJsonObject(text)) as Partial<EvolutionDecision>;
  return {
    diagnosis: parsed.diagnosis ?? "",
    chosenChange: parsed.chosenChange ?? "",
    rationale: parsed.rationale ?? "",
    uncertainty: Math.max(0, Math.min(1, Number(parsed.uncertainty ?? 0.6))),
    compileHeavy: Boolean(parsed.compileHeavy),
    validationCommand: parsed.validationCommand,
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.map((x) => String(x)).slice(0, 3)
      : []
  };
}

function gitChangedFiles(): string[] {
  const diff = exec("git diff --name-only");
  return diff.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function revertWorkingTree(): void {
  exec("git restore --staged --worktree .");
  exec("git clean -fd");
}

function ensureCleanStart(): void {
  const status = exec("git status --porcelain");
  if (status.stdout.trim()) {
    throw new Error("Working tree is not clean. Commit or stash changes before running evolve cycle.");
  }
}

async function generateDecision(goal: string): Promise<EvolutionDecision> {
  const config = readConfig();
  const observations = await gatherObservations();

  const prompt = [
    "You are selecting exactly one high-impact and bounded codebase improvement.",
    "Use a dialectic frame briefly: thesis, antithesis, synthesis.",
    "Output strict JSON with keys:",
    "diagnosis, chosenChange, rationale, uncertainty (0..1), compileHeavy (boolean), validationCommand, followUps (array max 3).",
    "Prefer low-risk changes if uncertainty is high.",
    `Mission: ${goal}`,
    "Context follows as JSON:",
    JSON.stringify(observations)
  ].join("\n");

  const result = await openAiChatCompletion(
    config.openAiApiKey,
    config.openAiModel,
    [
      { role: "system", content: "You are an autonomous software improvement planner." },
      { role: "user", content: prompt }
    ],
    []
  );

  return parseDecision(result.message.content ?? "{}");
}

function openIssueForUncertainty(change: string, rationale: string): void {
  const title = `Evolve follow-up: ${change.slice(0, 80) || "uncertain change proposal"}`;
  const body = [
    "Automated evolve cycle deferred change due to high uncertainty.",
    "",
    `Proposed change: ${change}`,
    `Rationale: ${rationale}`,
    "",
    "Action: human review requested."
  ].join("\n");

  exec(
    `gh issue create --title ${JSON.stringify(title)} --body ${JSON.stringify(body)} >/dev/null 2>&1 || true`
  );
}

function runLocalChecks(): { lint: boolean; test: boolean } {
  const lint = exec("bun run lint");
  const test = exec("bun test");
  return { lint: lint.code === 0, test: test.code === 0 };
}

async function runSpriteChecks(): Promise<{ lint: boolean; test: boolean }> {
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

  const run = outcome.run as { code?: number } | undefined;
  return { lint: run?.code === 0, test: run?.code === 0 };
}

function commitEvolution(change: string): void {
  exec("git add -A");
  const subject = change.replaceAll("\n", " ").slice(0, 72) || "automated improvement";
  const result = exec(`git commit -m ${JSON.stringify(`evolve(agent): ${subject}`)}`);
  if (result.code !== 0) {
    throw new Error(`commit failed: ${result.stderr}`);
  }
}

export async function runEvolveCycle(options: { dryRun?: boolean; goal?: string }): Promise<void> {
  const config = readConfig();
  mustHaveOpenAiKey(config);

  const logger = new JsonLogger(".fractal/logs", `evolve-${Date.now()}.jsonl`);
  const goal = options.goal ?? process.env.FRACTAL_EVOLVE_GOAL ?? DEFAULT_MISSION;
  const mode = options.dryRun ? "dry-run" : "real";

  ensureCleanStart();

  const decision = await generateDecision(goal);
  logger.info("decision", decision as unknown as Record<string, unknown>);

  if (!decision.chosenChange) {
    throw new Error("Evolve cycle produced empty change decision.");
  }

  if (options.dryRun) {
    console.log(JSON.stringify({ mode, goal, decision }, null, 2));
    return;
  }

  if (decision.uncertainty >= 0.75) {
    openIssueForUncertainty(decision.chosenChange, decision.rationale);
    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      filesTouched: [],
      lintOutcome: "skipped",
      testOutcome: "skipped",
      followUps: decision.followUps,
      failureNote: "Deferred due to high uncertainty; GitHub issue opened."
    });
    console.log("Evolve cycle deferred: high uncertainty, issue created.");
    return;
  }

  let lintPass = false;
  let testPass = false;

  try {
    const prompt = [
      "Implement exactly one bounded change in this repository.",
      `Chosen change: ${decision.chosenChange}`,
      `Rationale: ${decision.rationale}`,
      "Do not modify secrets or .git internals.",
      "Keep edits minimal and production-readable.",
      "Run commands via tools when needed and summarize outcomes."
    ].join("\n");

    const agentResult = await runAgent({
      task: prompt,
      mode: "evolve",
      evolveMission: goal,
      maxSteps: Math.min(config.maxSteps, 20),
      maxToolCalls: config.maxToolCalls
    });

    logger.info("agent_output", { output: agentResult.output, steps: agentResult.steps });

    const compileHeavy = decision.compileHeavy || isCompileHeavyTask(decision.chosenChange);
    if (compileHeavy) {
      const checks = await runSpriteChecks();
      lintPass = checks.lint;
      testPass = checks.test;
    } else {
      const checks = runLocalChecks();
      lintPass = checks.lint;
      testPass = checks.test;
    }

    const changedFiles = gitChangedFiles();
    if (changedFiles.length > config.maxFileChangesPerCycle) {
      throw new Error(
        `Changed files (${changedFiles.length}) exceed FRACTAL_MAX_CHANGED_FILES=${config.maxFileChangesPerCycle}.`
      );
    }

    if (!lintPass || !testPass) {
      throw new Error("Validation failed (lint or tests). Reverting cycle changes.");
    }

    commitEvolution(decision.chosenChange);

    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      filesTouched: changedFiles,
      lintOutcome: lintPass ? "pass" : "fail",
      testOutcome: testPass ? "pass" : "fail",
      followUps: decision.followUps
    });

    console.log("Evolve cycle complete: committed.");
  } catch (error) {
    revertWorkingTree();

    const message = error instanceof Error ? error.message : String(error);
    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      filesTouched: [],
      lintOutcome: lintPass ? "pass" : "fail",
      testOutcome: testPass ? "pass" : "fail",
      followUps: decision.followUps,
      failureNote: `${message} | Next attempt: reduce scope and retry one-file change.`
    });

    throw error;
  }
}
