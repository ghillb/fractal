import { appendFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import {
  serializeJournalMachineReadablePayload,
  validateJournalPlanHandoff,
  type JournalPayloadValidationResult
} from "./journal-schema.ts";

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

export type JournalReadDiagnostics = {
  rejectedCount: number;
  rejectionSummary: string[];
};

const HEADER = `# JOURNAL\n\nAutonomous evolve cycle log.\n\n`;
const ENTRY_MARKER_PREFIX = "<!-- FRACTAL_ENTRY ";
const ENTRY_MARKER_SUFFIX = " -->";
const HANDOFF_PREFIX = "- handoff_json: ";
const MAX_REJECTION_SUMMARY = 3;

export type JournalCapabilityDescriptor = {
  schemaVersion: string;
  module: string;
  readOnly: true;
  machineReadable: {
    markerPrefix: string;
    handoffPrefix: string;
    payloadCapabilities: string[];
  };
};

export const JOURNAL_CAPABILITY_DESCRIPTOR: JournalCapabilityDescriptor = {
  schemaVersion: "1.0",
  module: "src/evolve/journal.ts",
  readOnly: true,
  machineReadable: {
    markerPrefix: ENTRY_MARKER_PREFIX,
    handoffPrefix: HANDOFF_PREFIX,
    payloadCapabilities: ["cycle-status-inspection"]
  }
};

export function getJournalCapabilityDescriptor(): JournalCapabilityDescriptor {
  return JSON.parse(JSON.stringify(JOURNAL_CAPABILITY_DESCRIPTOR)) as JournalCapabilityDescriptor;
}

export function exportJournalCapabilityDescriptor(): string {
  return JSON.stringify(JOURNAL_CAPABILITY_DESCRIPTOR);
}

function summarizeRejections(results: JournalPayloadValidationResult<JournalPlanHandoff>[]): string[] {
  const counts = new Map<string, number>();

  for (const result of results) {
    if (result.ok) {
      continue;
    }

    counts.set(result.reason, (counts.get(result.reason) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, MAX_REJECTION_SUMMARY)
    .map(([reason, count]) => `${reason} (${count})`);
}

function parseJournalMarker(line: string): JournalPayloadValidationResult<JournalPlanHandoff> | undefined {
  const trimmed = line.trim();
  if (!trimmed.startsWith(ENTRY_MARKER_PREFIX) || !trimmed.endsWith(ENTRY_MARKER_SUFFIX)) {
    return undefined;
  }

  try {
    return validateJournalPlanHandoff(
      JSON.parse(trimmed.slice(ENTRY_MARKER_PREFIX.length, -ENTRY_MARKER_SUFFIX.length))
    );
  } catch {
    return { ok: false, reason: "marker payload must be valid JSON" };
  }
}

export function extractLatestPlanFromJournal(text: string): JournalPlanHandoff | undefined {
  return extractLatestPlanFromJournalWithDiagnostics(text).handoff;
}

export function extractLatestPlanFromJournalWithDiagnostics(
  text: string
): { handoff?: JournalPlanHandoff; diagnostics: JournalReadDiagnostics } {
  const lines = text.split("\n");
  const rejections: JournalPayloadValidationResult<JournalPlanHandoff>[] = [];

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim();
    if (!line) {
      continue;
    }

    const marker = parseJournalMarker(line);
    if (marker) {
      if (marker.ok) {
        return {
          handoff: marker.value,
          diagnostics: {
            rejectedCount: rejections.length,
            rejectionSummary: summarizeRejections(rejections)
          }
        };
      }

      rejections.push(marker);
      continue;
    }

    if (!line.startsWith(HANDOFF_PREFIX)) {
      continue;
    }

    try {
      const handoff = validateJournalPlanHandoff(JSON.parse(line.slice(HANDOFF_PREFIX.length)));
      if (handoff.ok) {
        return {
          handoff: handoff.value,
          diagnostics: {
            rejectedCount: rejections.length,
            rejectionSummary: summarizeRejections(rejections)
          }
        };
      }

      rejections.push(handoff);
    } catch {
      rejections.push({ ok: false, reason: "handoff payload must be valid JSON" });
    }
  }

  return {
    diagnostics: {
      rejectedCount: rejections.length,
      rejectionSummary: summarizeRejections(rejections)
    }
  };
}

export function countTrailingPlannedEntries(text: string): number {
  const entries = text
    .split("\n")
    .map((line) => parseJournalMarker(line))
    .filter((entry): entry is Extract<JournalPayloadValidationResult<JournalPlanHandoff>, { ok: true }> =>
      Boolean(entry?.ok)
    )
    .map((entry) => entry.value);
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
  const markerPayload = serializeJournalMachineReadablePayload(entry);
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
