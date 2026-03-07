import { exec } from "../core/shell.ts";
import type { ToolCallInput } from "./types.ts";

const BLOCKED_PATTERNS = [
  "rm -rf /",
  "git reset --hard",
  "git checkout --",
  "shutdown",
  "reboot",
  "> /dev/sda"
];

export async function runCommandTool(input: ToolCallInput): Promise<Record<string, unknown>> {
  const command = String(input.command ?? "").trim();
  if (!command) {
    throw new Error("command is required");
  }

  const lowered = command.toLowerCase();
  if (BLOCKED_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    throw new Error("blocked command pattern");
  }

  const result = exec(command);
  return {
    code: result.code,
    stdout: result.stdout.slice(0, 20000),
    stderr: result.stderr.slice(0, 12000)
  };
}
