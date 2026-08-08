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

const SECRET_ENV_NAME = /(?:^|_)(?:API_KEY|AUTH|CREDENTIALS?|PASS(?:WORD|WD)?|PRIVATE_KEY|SECRET|TOKEN)(?:_|$)/i;
const DEFAULT_COMMAND_TIMEOUT_SECONDS = 120;
const MAX_COMMAND_TIMEOUT_SECONDS = 300;

export function buildCommandEnvironment(
  source: Record<string, string | undefined> = process.env
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(source).filter(
      (entry): entry is [string, string] => entry[1] !== undefined && !SECRET_ENV_NAME.test(entry[0])
    )
  );
}

function commandTimeoutMs(raw = process.env.FRACTAL_COMMAND_TIMEOUT_SECONDS): number {
  const requested = Number.parseInt(raw ?? "", 10);
  const seconds = Number.isFinite(requested)
    ? Math.min(MAX_COMMAND_TIMEOUT_SECONDS, Math.max(1, requested))
    : DEFAULT_COMMAND_TIMEOUT_SECONDS;
  return seconds * 1_000;
}

export async function runCommandTool(input: ToolCallInput): Promise<Record<string, unknown>> {
  const command = String(input.command ?? "").trim();
  if (!command) {
    throw new Error("command is required");
  }

  const lowered = command.toLowerCase();
  if (BLOCKED_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    throw new Error("blocked command pattern");
  }

  const result = exec(command, {
    env: buildCommandEnvironment(),
    timeoutMs: commandTimeoutMs()
  });
  return {
    code: result.code,
    stdout: result.stdout.slice(0, 20000),
    stderr: result.stderr.slice(0, 12000)
  };
}
