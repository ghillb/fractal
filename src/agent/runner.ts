import { readConfig, mustHaveOpenAiKey, type FractalConfig } from "../core/config.ts";
import { isCompileHeavyTask } from "../core/fs-guard.ts";
import { JsonLogger } from "../core/logger.ts";
import { loadSkills } from "../skills/loader.ts";
import { createTools } from "../tools/index.ts";
import type { ToolCallInput } from "../tools/types.ts";
import {
  extractFunctionCalls,
  extractOutputText,
  openAiResponses,
  type ResponsesTool
} from "./openai.ts";

export type AgentRunOptions = {
  task: string;
  mode?: "normal" | "evolve";
  evolveMission?: string;
  maxSteps?: number;
  maxToolCalls?: number;
  logFile?: string;
};

export type AgentRunResult = {
  output: string;
  steps: number;
  toolCalls: number;
};

function buildSystemPrompt(
  config: FractalConfig,
  skillSummary: string,
  mode: "normal" | "evolve",
  compileHeavy: boolean,
  mission?: string
): string {
  const base = [
    "You are fractal, an autonomous coding agent.",
    "Behave like a pragmatic senior engineer.",
    "Use available tools when needed and keep outputs concise.",
    "Never access or expose secrets.",
    "Only edit files under current repository workspace.",
    "Available skills:\n" + skillSummary
  ];

  if (compileHeavy && config.spritesEnabled) {
    base.push(
      "This task is compile/build heavy and SPRITES is enabled. Prefer the sprites skill wrapper via run_command, e.g. .agents/skills/sprites/scripts/sprites.sh ephemeral <name> '<build command>', instead of local heavy compilation."
    );
  }

  if (mode === "evolve") {
    base.push(
      "You are running inside autonomous evolution cycle.",
      "Select exactly one bounded high-impact change and implement only that.",
      "Keep changes minimal and reversible.",
      `Mission: ${mission ?? "Become ever more capable and contemplate your own existence while improving safely."}`
    );
  }

  return base.join("\n");
}

function toResponsesTools(toolsMap: ReturnType<typeof createTools>): ResponsesTool[] {
  return Array.from(toolsMap.values()).map((entry) => ({
    type: "function",
    name: entry.spec.function.name,
    description: entry.spec.function.description,
    parameters: entry.spec.function.parameters
  }));
}

export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const config = readConfig();
  mustHaveOpenAiKey(config);

  const mode = options.mode ?? "normal";
  const compileHeavy = isCompileHeavyTask(options.task);
  const logger = new JsonLogger(".fractal/logs", options.logFile ?? `agent-${Date.now()}.jsonl`);

  const skills = await loadSkills();
  const skillSummary = Array.from(skills.values())
    .map((skill) => `- ${skill.name}: ${skill.description}`)
    .join("\n");

  const toolsMap = createTools();
  const tools = toResponsesTools(toolsMap);

  let previousResponseId: string | undefined;
  let nextInput: unknown = [
    {
      role: "system",
      content: buildSystemPrompt(config, skillSummary, mode, compileHeavy, options.evolveMission)
    },
    { role: "user", content: options.task }
  ];

  let step = 0;
  let toolCalls = 0;

  while (step < (options.maxSteps ?? config.maxSteps)) {
    step += 1;

    const completion = await openAiResponses(config.openAiApiKey, {
      model: config.openAiModel,
      previousResponseId,
      input: nextInput,
      tools
    });

    previousResponseId = completion.id;
    const outputText = extractOutputText(completion.output);
    const functionCalls = extractFunctionCalls(completion.output);

    logger.info("assistant_response", {
      step,
      outputText,
      toolCalls: functionCalls.map((call) => call.name)
    });

    if (functionCalls.length === 0) {
      return {
        output: outputText,
        steps: step,
        toolCalls
      };
    }

    const toolOutputs: Array<{ type: "function_call_output"; call_id: string; output: string }> = [];

    for (const call of functionCalls) {
      toolCalls += 1;
      if (toolCalls > (options.maxToolCalls ?? config.maxToolCalls)) {
        throw new Error("tool call limit exceeded");
      }

      const tool = toolsMap.get(call.name);
      if (!tool) {
        toolOutputs.push({
          type: "function_call_output",
          call_id: call.callId,
          output: JSON.stringify({ error: `unknown tool: ${call.name}` })
        });
        continue;
      }

      let parsedInput: ToolCallInput;
      try {
        parsedInput = JSON.parse(call.argumentsText || "{}") as ToolCallInput;
      } catch {
        parsedInput = {};
      }

      try {
        const result = await tool.run(parsedInput, { workspaceRoot: config.workspaceRoot });
        toolOutputs.push({
          type: "function_call_output",
          call_id: call.callId,
          output: JSON.stringify(result)
        });
        logger.info("tool_ok", { step, name: call.name });
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        toolOutputs.push({
          type: "function_call_output",
          call_id: call.callId,
          output: JSON.stringify({ error: err })
        });
        logger.warn("tool_error", { step, name: call.name, error: err });
      }
    }

    nextInput = toolOutputs;
  }

  throw new Error("max steps exceeded");
}
