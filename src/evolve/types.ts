export type ObserveData = {
  issues: Array<{ number: number; title: string; updatedAt: string }>;
  commits: Array<{ hash: string; subject: string; date: string }>;
  journalTail: string;
  consecutivePlanCount: number;
  latestPlan?: {
    timestampUtc: string;
    chosenChange: string;
    rationale: string;
    outcome: "planned" | "reverted";
    targetFiles: string[];
    blockingReason?: string;
    nextCyclePlan: string[];
  };
  recentHotFiles: string[];
  hnSignal: Array<Record<string, unknown>>;
};

export type EvolutionDecision = {
  diagnosis: string;
  chosenChange: string;
  rationale: string;
  uncertainty: number;
  executionMode: "implement" | "plan";
  compileHeavy: boolean;
  targetFiles: string[];
  blockingReason?: string;
  nextCyclePlan: string[];
  validationCommand?: string;
  followUps: string[];
};
