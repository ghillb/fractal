export type ObserveRecentCycleSummaryEntry = {
  timestampUtc: string;
  chosenChange: string;
  rationale: string;
  outcome: "committed" | "planned" | "reverted";
  targetFiles: string[];
  nextCyclePlan: string[];
  blockingReason?: string;
};

export type ObserveLatestCycleHandoff = {
  outcome: "committed" | "planned" | "reverted";
  targetFiles: string[];
  finished: boolean;
  unfinished: boolean;
};

export type ObserveLatestCycleCompletionSummary = {
  outcome: "committed" | "planned" | "reverted";
  targetFiles: string[];
  finished: boolean;
  unfinished: boolean;
  summary: string;
};

export type ObserveHnSignalEntry = {
  title: string;
  url: string;
  hnUrl: string;
  points: number;
  comments: number;
  author: string;
  createdAt: string;
};

export type ObserveJournalIntegrity = {
  rejectedHistoricalEntryCount: number;
  rejectionSummary?: string[];
};

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
  latestCycleOutcome?: ObserveLatestCycleHandoff["outcome"];
  latestCycleTargetFiles: string[];
  latestCycleFinished?: boolean;
  latestCycleUnfinished?: boolean;
  latestCycleCompletionSummary?: string;
  journalIntegrity: ObserveJournalIntegrity;
  recentCycleSummary: ObserveRecentCycleSummaryEntry[];
  recentHotFiles: string[];
  hnSignal: ObserveHnSignalEntry[];
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
