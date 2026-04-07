export type ParsedJournalBlock = {
  markerLine: number;
  kind: "entry" | "handoff";
  payload: unknown;
};

export type JournalMachineReadableBlock = {
  timestampUtc: string;
  chosenChange: string;
  rationale: string;
  outcome: "committed" | "planned" | "reverted";
  targetFiles: string[];
  nextCyclePlan: string[];
  blockingReason?: string;
  cycleStatus?: CycleOutcomeCode;
};

export type CycleOutcomeCode = "ok" | "no-op" | "failed";

export function deriveCycleStatus(outcome: JournalMachineReadableBlock["outcome"]): CycleOutcomeCode {
  return outcome === "committed" ? "ok" : outcome === "planned" ? "no-op" : "failed";
}

export const ENTRY_PREFIX = "<!-- FRACTAL_ENTRY ";
export const ENTRY_SUFFIX = " -->";
export const HANDOFF_PREFIX = "- handoff_json: ";

export function parseMachineReadableBlocks(text: string): ParsedJournalBlock[] {
  const blocks: ParsedJournalBlock[] = [];

  for (const [index, rawLine] of text.split("\n").entries()) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith(ENTRY_PREFIX) && line.endsWith(ENTRY_SUFFIX)) {
      blocks.push({
        markerLine: index + 1,
        kind: "entry",
        payload: JSON.parse(line.slice(ENTRY_PREFIX.length, -ENTRY_SUFFIX.length))
      });
      continue;
    }

    if (line.startsWith(HANDOFF_PREFIX)) {
      blocks.push({
        markerLine: index + 1,
        kind: "handoff",
        payload: JSON.parse(line.slice(HANDOFF_PREFIX.length))
      });
    }
  }

  return blocks;
}

export function validateJournalMachineReadablePayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "payload must be an object";
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.timestampUtc !== "string" || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(record.timestampUtc)) {
    return "timestampUtc must be an ISO-8601 UTC string";
  }

  if (typeof record.chosenChange !== "string" || record.chosenChange === "") {
    return "chosenChange must be a non-empty string";
  }

  if (typeof record.rationale !== "string" || record.rationale === "") {
    return "rationale must be a non-empty string";
  }

  if (record.outcome !== "committed" && record.outcome !== "planned" && record.outcome !== "reverted") {
    return 'outcome must be one of "committed", "planned", or "reverted"';
  }

  if (record.cycleStatus !== undefined && record.cycleStatus !== "ok" && record.cycleStatus !== "no-op" && record.cycleStatus !== "failed") {
    return 'cycleStatus must be one of "ok", "no-op", or "failed" when present';
  }

  if (!Array.isArray(record.targetFiles) || !record.targetFiles.every((item) => typeof item === "string")) {
    return "targetFiles must be an array of strings";
  }

  if (!Array.isArray(record.nextCyclePlan) || !record.nextCyclePlan.every((item) => typeof item === "string")) {
    return "nextCyclePlan must be an array of strings";
  }

  if (record.blockingReason !== undefined && (typeof record.blockingReason !== "string" || record.blockingReason === "")) {
    return "blockingReason must be a non-empty string when present";
  }

  return undefined;
}

export function validateMachineReadableBlock(block: ParsedJournalBlock): string | undefined {
  const payloadError = validateJournalMachineReadablePayload(block.payload);
  if (!payloadError) {
    return undefined;
  }

  return `invalid ${block.kind} block at JOURNAL.md:${block.markerLine}: ${payloadError}`;
}
