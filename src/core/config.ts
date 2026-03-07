export type FractalConfig = {
  workspaceRoot: string;
  openAiApiKey: string;
  openAiModel: string;
  perplexityApiKey?: string;
  spritesEnabled: boolean;
  spritesDefaultName: string;
  maxSteps: number;
  maxToolCalls: number;
  maxFileChangesPerCycle: number;
  maxCycleSeconds: number;
};

export function readConfig(): FractalConfig {
  const workspaceRoot = process.cwd();
  const openAiApiKey = process.env.OPENAI_API_KEY ?? "";

  return {
    workspaceRoot,
    openAiApiKey,
    openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    spritesEnabled: (process.env.SPRITES_ENABLED ?? "false") === "true",
    spritesDefaultName: process.env.SPRITES_DEFAULT_NAME ?? "qbuild",
    maxSteps: Number.parseInt(process.env.FRACTAL_MAX_STEPS ?? "16", 10),
    maxToolCalls: Number.parseInt(process.env.FRACTAL_MAX_TOOL_CALLS ?? "64", 10),
    maxFileChangesPerCycle: Number.parseInt(process.env.FRACTAL_MAX_CHANGED_FILES ?? "8", 10),
    maxCycleSeconds: Number.parseInt(process.env.FRACTAL_MAX_CYCLE_SECONDS ?? "900", 10)
  };
}

export function mustHaveOpenAiKey(config: FractalConfig): void {
  if (!config.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is required for agent/evolve runs.");
  }
}
