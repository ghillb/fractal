import type { JournalEntry, JournalPlanHandoff } from "./journal.ts";
import { deriveCycleStatus } from "./journal-validator.ts";

export type JournalMachineReadablePayload = Pick<
  JournalEntry,
  "timestampUtc" | "chosenChange" | "rationale" | "outcome" | "targetFiles" | "nextCyclePlan"
> & {
  blockingReason?: string;
  cycleStatus: ReturnType<typeof deriveCycleStatus>;
  capabilities: CapabilityMarker[];
};

export type CapabilityMarker = "cycle-status-inspection";

export const CYCLE_STATUS_INSPECTION_CAPABILITY: CapabilityMarker = "cycle-status-inspection";

export type JournalPayloadValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function buildJournalMachineReadablePayload(entry: JournalEntry): JournalMachineReadablePayload {
  return {
    timestampUtc: entry.timestampUtc,
    chosenChange: entry.chosenChange,
    rationale: entry.rationale,
    outcome: entry.outcome,
    targetFiles: entry.targetFiles,
    blockingReason: entry.blockingReason,
    cycleStatus: deriveCycleStatus(entry.outcome),
    capabilities: [CYCLE_STATUS_INSPECTION_CAPABILITY],
    nextCyclePlan: entry.nextCyclePlan
  };
}

export function validateJournalMachineReadablePayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "payload must be an object";
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.timestampUtc !== "string" || !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(record.timestampUtc)) {
    return "timestampUtc must be an ISO-8601 UTC string";
  }

  if (!isNonEmptyString(record.chosenChange)) {
    return "chosenChange must be a non-empty string";
  }

  if (!isNonEmptyString(record.rationale)) {
    return "rationale must be a non-empty string";
  }

  if (record.outcome !== "committed" && record.outcome !== "planned" && record.outcome !== "reverted") {
    return 'outcome must be one of "committed", "planned", or "reverted"';
  }

  if (!isStringArray(record.targetFiles)) {
    return "targetFiles must be an array of strings";
  }

  if (!isStringArray(record.nextCyclePlan)) {
    return "nextCyclePlan must be an array of strings";
  }

  if (record.blockingReason !== undefined && !isNonEmptyString(record.blockingReason)) {
    return "blockingReason must be a non-empty string when present";
  }

  return undefined;
}

export function validateJournalPlanHandoff(value: unknown): JournalPayloadValidationResult<JournalPlanHandoff> {
  const validationError = validateJournalMachineReadablePayload(value);
  if (validationError) {
    return { ok: false, reason: validationError };
  }

  const parsed = value as JournalMachineReadablePayload;
  if (parsed.outcome === "committed") {
    return {
      ok: true,
      value: {
        timestampUtc: parsed.timestampUtc,
        chosenChange: parsed.chosenChange,
        rationale: parsed.rationale,
        outcome: "planned",
        targetFiles: parsed.targetFiles,
        blockingReason: parsed.blockingReason,
        nextCyclePlan: parsed.nextCyclePlan
      }
    };
  }

  if (parsed.outcome !== "planned" && parsed.outcome !== "reverted") {
    return { ok: false, reason: 'outcome must be "planned" or "reverted" for handoff consumption' };
  }

  if (parsed.nextCyclePlan.length === 0) {
    return { ok: false, reason: "nextCyclePlan must contain at least one step for handoff consumption" };
  }

  return {
    ok: true,
    value: {
      timestampUtc: parsed.timestampUtc,
      chosenChange: parsed.chosenChange,
      rationale: parsed.rationale,
      outcome: parsed.outcome,
      targetFiles: parsed.targetFiles,
      blockingReason: parsed.blockingReason,
      nextCyclePlan: parsed.nextCyclePlan
    }
  };
}

export function parseJournalPlanHandoff(value: unknown): JournalPlanHandoff | undefined {
  const result = validateJournalPlanHandoff(value);
  return result.ok ? result.value : undefined;
}

export function serializeJournalMachineReadablePayload(entry: JournalEntry): string {
  const payload = buildJournalMachineReadablePayload(entry);
  const validationError = validateJournalMachineReadablePayload(payload);
  if (validationError) {
    throw new Error(`Invalid evolve journal payload: ${validationError}`);
  }

  return JSON.stringify(payload);
}
