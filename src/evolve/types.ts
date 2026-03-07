export type ObserveData = {
  issues: Array<{ number: number; title: string; updatedAt: string }>;
  commits: Array<{ hash: string; subject: string; date: string }>;
  journalTail: string;
  hnSignal: Array<Record<string, unknown>>;
};

export type EvolutionDecision = {
  diagnosis: string;
  chosenChange: string;
  rationale: string;
  uncertainty: number;
  compileHeavy: boolean;
  validationCommand?: string;
  followUps: string[];
};
