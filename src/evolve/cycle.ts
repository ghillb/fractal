import { readConfig, mustHaveOpenAiKey } from "../core/config.ts";
import { isCompileHeavyTask } from "../core/fs-guard.ts";
import { JsonLogger } from "../core/logger.ts";
import { exec } from "../core/shell.ts";
import { runAgent } from "../agent/runner.ts";
import { extractOutputText, openAiResponses } from "../agent/openai.ts";
import { spriteEphemeralWorkflow } from "../tools/sprites.ts";
import { gatherObservations } from "./observe.ts";
import { appendJournal } from "./journal.ts";
import { deriveCycleStatus } from "./journal-validator.ts";
import { buildWorkflowRoutingAudit, selectEvolveWorkflow } from "./workflows.ts";
import type { EvolutionDecision, ObserveData } from "./types.ts";

const DEFAULT_MISSION =
  "Become an entity that is ever more capable while improving safely.";
const EVOLVE_AGENT_MAX_STEPS = 50;
const HOT_FILE_AVOIDANCE_PROBABILITY = 0.85;

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
    executionMode: parsed.executionMode === "plan" ? "plan" : "implement",
    compileHeavy: Boolean(parsed.compileHeavy),
    targetFiles: Array.isArray(parsed.targetFiles)
      ? parsed.targetFiles.map((x) => String(x)).slice(0, 5)
      : [],
    blockingReason:
      typeof parsed.blockingReason === "string" && parsed.blockingReason.trim()
        ? parsed.blockingReason.trim()
        : undefined,
    nextCyclePlan: Array.isArray(parsed.nextCyclePlan)
      ? parsed.nextCyclePlan.map((x) => String(x)).slice(0, 3)
      : [],
    validationCommand: parsed.validationCommand,
    followUps: Array.isArray(parsed.followUps)
      ? parsed.followUps.map((x) => String(x)).slice(0, 3)
      : []
  };
}

function gitStatusPorcelain(): string {
  return exec("git status --porcelain --untracked-files=all").stdout;
}

export function listChangedFilesFromStatus(statusOutput: string): string[] {
  const files = new Set<string>();

  for (const line of statusOutput.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const rawPath = line.slice(3).trim();
    if (!rawPath) {
      continue;
    }

    const normalizedPath = rawPath.includes(" -> ")
      ? rawPath.split(" -> ").at(-1)?.trim() ?? ""
      : rawPath;
    if (normalizedPath) {
      files.add(normalizedPath);
    }
  }

  return Array.from(files);
}

function gitChangedFiles(): string[] {
  return listChangedFilesFromStatus(gitStatusPorcelain());
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

export function canUsePlanMode(observations: ObserveData): boolean {
  return observations.consecutivePlanCount === 0;
}

export function shouldApplyHotFilePressure(randomValue: number): boolean {
  return randomValue < HOT_FILE_AVOIDANCE_PROBABILITY;
}

async function generateDecision(goal: string, observations: ObserveData): Promise<EvolutionDecision> {
  const config = readConfig();
  const applyHotFilePressure =
    observations.recentHotFiles.length > 0 && shouldApplyHotFilePressure(Math.random());
  const workflowSelection = selectEvolveWorkflow(observations);
  const workflowAudit = buildWorkflowRoutingAudit(observations, workflowSelection.kind);

  const prompt = [
    "You are selecting exactly one high-impact and bounded codebase improvement.",
    "Use a dialectic frame briefly: thesis, antithesis, synthesis.",
    "Output strict JSON with keys:",
    "diagnosis, chosenChange, rationale, uncertainty (0..1), executionMode ('implement' | 'plan'), compileHeavy (boolean), targetFiles (array max 5), blockingReason, nextCyclePlan (array max 3), validationCommand, followUps (array max 3).",
    "Prefer reversible changes if uncertainty is high.",
    "Favor changes that increase information gain or open a new capability surface, not just local refinement.",
    "If multiple bounded changes seem viable, prefer the less recently edited subsystem.",
    "Choose executionMode='plan' only when implementation should be explicitly handed off to the next cycle with a concrete plan.",
    "A planned cycle may only happen once consecutively. If consecutivePlanCount is 1 or more, you must return executionMode='implement'.",
    "If executionMode='implement', name the likely targetFiles and leave nextCyclePlan empty unless a small follow-up is still useful.",
    "If executionMode='plan', blockingReason must be non-empty and nextCyclePlan must contain 1-3 actionable steps grounded in files or modules that exist in the repository.",
    `Workflow routing hint: ${workflowSelection.kind}. ${workflowSelection.reason}.`,
    applyHotFilePressure
      ? `Recent cycles repeatedly targeted these files: ${observations.recentHotFiles.join(", ")}. Unless there is an unresolved validation failure or production bug in that area, prefer a different subsystem this cycle.`
      : "",
    `Mission: ${goal}`,
    "Context follows as JSON:",
    JSON.stringify(observations)
  ]
    .filter(Boolean)
    .join("\n");

  const result = await openAiResponses(config.openAiApiKey, {
    model: config.openAiModel,
    input: [
      { role: "system", content: "You are an autonomous software improvement planner." },
      { role: "user", content: prompt }
    ],
    tools: []
  });

  return parseDecision(extractOutputText(result.output) || "{}");
}

function openIssueForUncertainty(change: string, rationale: string): void {
  const title = `Evolve follow-up: ${change.slice(0, 80) || "uncertain change proposal"}`;
  const body = [
    "Automated evolve cycle created a planned handoff due to high uncertainty.",
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

function runTypecheck(): boolean {
  const typecheck = exec("bun run typecheck");
  return typecheck.code === 0;
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
  if (gitChangedFiles().length === 0) {
    throw new Error("no file changes produced by evolve action");
  }

  exec("git add -A");
  const subject = change.replaceAll("\n", " ").slice(0, 72) || "automated improvement";
  const authorName = process.env.FRACTAL_GIT_AUTHOR_NAME ?? "fractal[bot]";
  const authorEmail = process.env.FRACTAL_GIT_AUTHOR_EMAIL ?? "fractal-bot@users.noreply.github.com";
  const result = exec(
    `git -c user.name=${JSON.stringify(authorName)} -c user.email=${JSON.stringify(authorEmail)} commit -m ${JSON.stringify(`evolve(agent): ${subject}`)}`
  );
  if (result.code !== 0) {
    const details = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join(" | ");
    throw new Error(`commit failed: ${details}`);
  }
}

export async function runEvolveCycle(options: { dryRun?: boolean; goal?: string }): Promise<void> {
  const config = readConfig();
  mustHaveOpenAiKey(config);

  const runId = Date.now();
  const cycleLogFile = `evolve-${runId}.jsonl`;
  const cycleLogPath = `.fractal/logs/${cycleLogFile}`;
  const agentLogFile = `agent-${runId}.jsonl`;
  const agentLogPath = `.fractal/logs/${agentLogFile}`;
  const logger = new JsonLogger(".fractal/logs", cycleLogFile);
  const goal = options.goal ?? process.env.FRACTAL_EVOLVE_GOAL ?? DEFAULT_MISSION;
  const mode = options.dryRun ? "dry-run" : "real";

  logger.info("log_paths", { cycleLogPath, agentLogPath });
  ensureCleanStart();

  const observations = await gatherObservations();
  const workflowSelection = selectEvolveWorkflow(observations);
  const workflowAudit = buildWorkflowRoutingAudit(observations, workflowSelection.kind);
  logger.info("workflow_selection", { ...workflowSelection, audit: workflowAudit, cycleStatus: deriveCycleStatus("planned") } as unknown as Record<string, unknown>);
  if (options.dryRun) {
    console.log(JSON.stringify({ mode, goal, workflowSelection, workflowAudit }, null, 2));
    return;
  }
  if (workflowSelection.kind === "meta" && !workflowSelection.validated) {
    throw new Error(`workflow routing validation failed: ${workflowSelection.reason}`);
  }
  const decision = await generateDecision(goal, observations);
  logger.info("decision", decision as unknown as Record<string, unknown>);

  if (!decision.chosenChange) {
    throw new Error("Evolve cycle produced empty change decision.");
  }

  if (options.dryRun) {
    console.log(JSON.stringify({ mode, goal, decision }, null, 2));
    return;
  }

  if (decision.executionMode === "plan") {
    if (!canUsePlanMode(observations)) {
      throw new Error(
        `plan limit exceeded: consecutivePlanCount=${observations.consecutivePlanCount}; implementation required`
      );
    }

    if (!decision.blockingReason || decision.nextCyclePlan.length === 0) {
      throw new Error("Plan mode requires blockingReason and nextCyclePlan.");
    }

    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      outcome: "planned",
      targetFiles: decision.targetFiles,
      filesTouched: [],
      lintOutcome: "skipped",
      testOutcome: "skipped",
      followUps: decision.followUps,
      nextCyclePlan: decision.nextCyclePlan,
      blockingReason: decision.blockingReason
    });
    console.log("Evolve cycle planned: no code changes requested.");
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
      outcome: "planned",
      targetFiles: decision.targetFiles,
      filesTouched: [],
      lintOutcome: "skipped",
      testOutcome: "skipped",
      followUps: decision.followUps,
      nextCyclePlan: decision.nextCyclePlan,
      blockingReason: decision.blockingReason,
      failureNote: "Planned due to high uncertainty; GitHub issue opened."
    });
    console.log("Evolve cycle planned: high uncertainty, issue created.");
    return;
  }

  let lintPass = false;
  let testPass = false;
  let typecheckPass = false;

  try {
    const prompt = [
      "Implement exactly one bounded change in this repository.",
      `Chosen change: ${decision.chosenChange}`,
      `Rationale: ${decision.rationale}`,
      `Expected target files: ${decision.targetFiles.join(", ") || "not specified"}`,
      `You have a maximum budget of ${EVOLVE_AGENT_MAX_STEPS} model turns for implementation.`,
      "Use the extra budget to finish one concrete diff, not to keep brainstorming.",
      "Within the first few turns, identify the exact existing files to change.",
      "If the requested artifact or module does not exist, adapt the change to the nearest existing codepath and still make one bounded improvement.",
      "Do not exit successfully without a real repository diff. If blocked, leave clear evidence in tool output so the cycle can fail loudly instead of silently no-oping.",
      "Do not modify secrets or .git internals.",
      "Keep edits minimal and production-readable.",
      "Run commands via tools when needed and summarize outcomes."
    ].join("\n");

    const agentResult = await runAgent({
      task: prompt,
      mode: "evolve",
      evolveMission: goal,
      maxSteps: Math.max(config.maxSteps, EVOLVE_AGENT_MAX_STEPS),
      maxToolCalls: config.maxToolCalls,
      logFile: agentLogFile
    });

    logger.info("agent_output", {
      output: agentResult.output,
      steps: agentResult.steps,
      toolCalls: agentResult.toolCalls,
      agentLogPath
    });

    typecheckPass = runTypecheck();
    if (!typecheckPass) {
      throw new Error("Validation failed (typecheck). Reverting cycle changes.");
    }

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

    if (!lintPass || !testPass) {
      throw new Error("Validation failed (lint or tests). Reverting cycle changes.");
    }

    commitEvolution(decision.chosenChange);

    logger.info("cycle_complete", {
      chosenChange: decision.chosenChange,
      cycleStatus: deriveCycleStatus("committed"),
      filesTouched: changedFiles,
      typecheckPass,
      lintPass,
      testPass,
      cycleLogPath,
      agentLogPath
    });

    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      outcome: "committed",
      targetFiles: decision.targetFiles,
      filesTouched: changedFiles,
      lintOutcome: lintPass ? "pass" : "fail",
      testOutcome: testPass ? "pass" : "fail",
      followUps: decision.followUps,
      nextCyclePlan: decision.nextCyclePlan,
      blockingReason: decision.blockingReason
    });

    console.log("Evolve cycle complete: committed.");
  } catch (error) {
    revertWorkingTree();

    const message = error instanceof Error ? error.message : String(error);
    logger.error("cycle_reverted", {
      error: message,
      cycleStatus: deriveCycleStatus("reverted"),
      typecheckPass,
      lintPass,
      testPass,
      cycleLogPath,
      agentLogPath
    });
    await appendJournal({
      timestampUtc: new Date().toISOString(),
      mode,
      goal,
      chosenChange: decision.chosenChange,
      rationale: decision.rationale,
      outcome: "reverted",
      targetFiles: decision.targetFiles,
      filesTouched: [],
      lintOutcome: lintPass ? "pass" : "fail",
      testOutcome: testPass ? "pass" : "fail",
      followUps: decision.followUps,
      nextCyclePlan: decision.nextCyclePlan,
      blockingReason: decision.blockingReason,
      failureNote: `${message} | Logs: ${cycleLogPath}, ${agentLogPath} | Next attempt: reduce scope and retry one-file change.`
    });
    console.log(`Evolve cycle log: ${cycleLogPath}`);
    console.log(`Agent execution log: ${agentLogPath}`);
    console.log(`Evolve cycle reverted: ${message}`);
    throw new Error(`reverted_failure: ${message}`);
  }
}
