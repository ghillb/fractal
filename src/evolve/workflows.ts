import type { ObserveData } from "./types.ts";

export type EvolveWorkflowKind = "task" | "meta";

export type EvolveWorkflowSelection = {
  kind: EvolveWorkflowKind;
  reason: string;
  validated: boolean;
};

export function selectEvolveWorkflow(observations: ObserveData): EvolveWorkflowSelection {
  const hasMetaSignals = observations.issues.length > 0 || observations.journalIntegrity.rejectedHistoricalEntryCount > 0;
  const shouldUseMeta = hasMetaSignals && observations.repositoryActivity.freshEnoughForPlanning;

  if (shouldUseMeta) {
    return {
      kind: "meta",
      reason: observations.issues.length > 0
        ? "open issues indicate orchestration/triage work"
        : "journal integrity noise indicates meta workflow is safer",
      validated: true
    };
  }

  return {
    kind: "task",
    reason: observations.consecutivePlanCount > 0
      ? "recent planning already consumed the meta slot; task workflow should implement"
      : "defaulting to task workflow for bounded implementation",
    validated: observations.consecutivePlanCount === 0
  };
}

export function canRunWorkflowKind(
  requestedKind: EvolveWorkflowKind,
  observations: ObserveData
): boolean {
  return selectEvolveWorkflow(observations).kind === requestedKind;
}
