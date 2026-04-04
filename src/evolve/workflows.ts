import type { ObserveData } from "./types.ts";

export type EvolveWorkflowKind = "task" | "meta";

export type EvolveWorkflowSelection = {
  kind: EvolveWorkflowKind;
  reason: string;
  validated: boolean;
};

function hasMetaSignals(observations: ObserveData): boolean {
  return observations.issues.length > 0 || observations.journalIntegrity.rejectedHistoricalEntryCount > 0;
}

export function selectEvolveWorkflow(observations: ObserveData): EvolveWorkflowSelection {
  const metaEligible = hasMetaSignals(observations) && observations.repositoryActivity.freshEnoughForPlanning;
  const consecutivePlanCount = observations.consecutivePlanCount;

  if (metaEligible && consecutivePlanCount === 0) {
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
    reason: consecutivePlanCount > 0
      ? "recent planning already consumed the meta slot; task workflow should implement"
      : metaEligible
        ? "meta workflow is selected but blocked by consecutive planning guard"
        : "defaulting to task workflow for bounded implementation",
    validated: consecutivePlanCount === 0 && !metaEligible
  };
}

export function canRunWorkflowKind(
  requestedKind: EvolveWorkflowKind,
  observations: ObserveData
): boolean {
  return selectEvolveWorkflow(observations).kind === requestedKind;
}

export function assertWorkflowSelectionPrecedence(
  observations: ObserveData,
  requestedKind: EvolveWorkflowKind
): EvolveWorkflowSelection {
  const selection = selectEvolveWorkflow(observations);

  if (selection.kind !== requestedKind) {
    throw new Error(
      `Workflow selection mismatch: requested ${requestedKind}, selected ${selection.kind} (${selection.reason})`
    );
  }

  return selection;
}
