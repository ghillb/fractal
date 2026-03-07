import { readConfig, mustHaveOpenAiKey, type FractalConfig } from "../core/config.ts";
import { isCompileHeavyTask } from "../core/fs-guard.ts";
import { JsonLogger } from "../core/logger.ts";
import { loadSkills } from "../skills/loader.ts";
import { createTools } from "../tools/index.ts";
import type { OpenAiToolSpec, ToolCallInput } from "../tools/types.ts";
import { type ChatMessage, openAiChatCompletion } from "./openai.ts";

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
  const toolSpecs: OpenAiToolSpec[] = Array.from(toolsMap.values()).map((entry) => entry.spec);

  const messages: ChatMessage[] = [
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

    const completion = await openAiChatCompletion(
      config.openAiApiKey,
      config.openAiModel,
      messages,
      toolSpecs
    );

    const assistantMessage = completion.message;
    messages.push(assistantMessage);

    logger.info("assistant_message", {
      step,
      content: assistantMessage.content,
      toolCalls: assistantMessage.tool_calls?.map((call) => call.function.name)
    });

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      return {
        output: assistantMessage.content ?? "",
        steps: step,
        toolCalls
      };
    }

    for (const call of assistantMessage.tool_calls) {
      toolCalls += 1;
      if (toolCalls > (options.maxToolCalls ?? config.maxToolCalls)) {
        throw new Error("tool call limit exceeded");
      }

      const tool = toolsMap.get(call.function.name);
      if (!tool) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify({ error: `unknown tool: ${call.function.name}` })
        });
        continue;
      }

      let parsedInput: ToolCallInput;
      try {
        parsedInput = JSON.parse(call.function.arguments || "{}") as ToolCallInput;
      } catch {
        parsedInput = {};
      }

      try {
        const result = await tool.run(parsedInput, { workspaceRoot: config.workspaceRoot });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result)
        });
        logger.info("tool_ok", { step, name: call.function.name });
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify({ error: err })
        });
        logger.warn("tool_error", { step, name: call.function.name, error: err });
      }
    }
  }

  throw new Error("max steps exceeded");
}
