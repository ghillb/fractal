import { appendFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { validateJournalMachineReadablePayload } from "./journal-validator.ts";

export type JournalOutcome = "committed" | "planned" | "reverted";

export type JournalEntry = {
  timestampUtc: string;
  mode: "dry-run" | "real";
  goal: string;
  chosenChange: string;
  rationale: string;
  outcome: JournalOutcome;
  targetFiles: string[];
  filesTouched: string[];
  lintOutcome: "pass" | "fail" | "skipped";
  testOutcome: "pass" | "fail" | "skipped";
  followUps: string[];
  nextCyclePlan: string[];
  blockingReason?: string;
  failureNote?: string;
};

export type JournalPlanHandoff = {
  timestampUtc: string;
  chosenChange: string;
  rationale: string;
  outcome: Exclude<JournalOutcome, "committed">;
  targetFiles: string[];
  blockingReason?: string;
  nextCyclePlan: string[];
};

const HEADER = `# JOURNAL\n\nAutonomous evolve cycle log.\n\n`;
const ENTRY_MARKER_PREFIX = "<!-- FRACTAL_ENTRY ";
const ENTRY_MARKER_SUFFIX = " -->";
const HANDOFF_PREFIX = "- handoff_json: ";

function toJournalPlanHandoff(value: unknown): JournalPlanHandoff | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const parsed = value as Partial<JournalPlanHandoff>;
  if (parsed.outcome !== "planned" && parsed.outcome !== "reverted") {
    return undefined;
  }

  if (
    !Array.isArray(parsed.targetFiles) ||
    !Array.isArray(parsed.nextCyclePlan) ||
    parsed.nextCyclePlan.length === 0
  ) {
    return undefined;
  }

  return {
    timestampUtc: typeof parsed.timestampUtc === "string" ? parsed.timestampUtc : "",
    chosenChange: typeof parsed.chosenChange === "string" ? parsed.chosenChange : "",
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "",
    outcome: parsed.outcome,
    targetFiles: parsed.targetFiles.map((item) => String(item)).filter(Boolean),
    blockingReason:
      typeof parsed.blockingReason === "string" && parsed.blockingReason.trim()
        ? parsed.blockingReason.trim()
        : undefined,
    nextCyclePlan: parsed.nextCyclePlan.map((item) => String(item)).filter(Boolean)
  };
}

function parseJournalMarker(line: string): JournalPlanHandoff | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith(ENTRY_MARKER_PREFIX) || !trimmed.endsWith(ENTRY_MARKER_SUFFIX)) {
    return undefined;
  }

  try {
    return toJournalPlanHandoff(
      JSON.parse(trimmed.slice(ENTRY_MARKER_PREFIX.length, -ENTRY_MARKER_SUFFIX.length))
    );
  } catch {
    return undefined;
  }
}

function buildMachineReadablePayload(entry: JournalEntry) {
  return {
    timestampUtc: entry.timestampUtc,
    chosenChange: entry.chosenChange,
    rationale: entry.rationale,
    outcome: entry.outcome,
    targetFiles: entry.targetFiles,
    blockingReason: entry.blockingReason,
    nextCyclePlan: entry.nextCyclePlan
  };
}

function serializeValidatedMachineReadablePayload(entry: JournalEntry): string {
  const payload = buildMachineReadablePayload(entry);
  const validationError = validateJournalMachineReadablePayload(payload);
  if (validationError) {
    throw new Error(`Invalid evolve journal payload: ${validationError}`);
  }

  return JSON.stringify(payload);
}

export function extractLatestPlanFromJournal(text: string): JournalPlanHandoff | undefined {
  const lines = text.split("\n");
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const marker = parseJournalMarker(line);
    if (marker) {
      return marker;
    }

    if (!line.startsWith(HANDOFF_PREFIX)) {
      continue;
    }

    try {
      const handoff = toJournalPlanHandoff(JSON.parse(line.slice(HANDOFF_PREFIX.length)));
      if (handoff) {
        return handoff;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

export function countTrailingPlannedEntries(text: string): number {
  const entries = text
    .split("\n")
    .map((line) => parseJournalMarker(line))
    .filter((entry): entry is JournalPlanHandoff => Boolean(entry));
  let count = 0;

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index]?.outcome !== "planned") {
      break;
    }

    count += 1;
  }

  return count;
}

export async function ensureJournal(): Promise<void> {
  try {
    await access("JOURNAL.md", constants.F_OK);
  } catch {
    await appendFile("JOURNAL.md", HEADER, "utf8");
  }
}

export async function appendJournal(entry: JournalEntry): Promise<void> {
  await ensureJournal();
  const markerPayload = serializeValidatedMachineReadablePayload(entry);
  const block = [
    `${ENTRY_MARKER_PREFIX}${markerPayload}${ENTRY_MARKER_SUFFIX}`,
    `## Entry ${entry.timestampUtc}`,
    `- timestamp_utc: ${entry.timestampUtc}`,
    `- mode: ${entry.mode}`,
    `- goal: ${entry.goal}`,
    `- chosen_change: ${entry.chosenChange}`,
    `- rationale: ${entry.rationale}`,
    `- outcome: ${entry.outcome}`,
    `- target_files: ${entry.targetFiles.join(", ") || "none"}`,
    `- files_touched: ${entry.filesTouched.join(", ") || "none"}`,
    `- lint: ${entry.lintOutcome}`,
    `- tests: ${entry.testOutcome}`,
    `- follow_ups: ${(entry.followUps.slice(0, 3) || []).join(" | ") || "none"}`,
    `- next_cycle_plan: ${(entry.nextCyclePlan.slice(0, 3) || []).join(" | ") || "none"}`,
    entry.blockingReason ? `- blocking_reason: ${entry.blockingReason}` : "",
    `- handoff_json: ${markerPayload}`,
    entry.failureNote ? `- failure_note: ${entry.failureNote}` : "",
    ""
  ]
    .filter(Boolean)
    .join("\n");

  await appendFile("JOURNAL.md", `${block}\n`, "utf8");
}
