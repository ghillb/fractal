import { afterEach, describe, expect, test } from "bun:test";
import { buildCommandEnvironment, runCommandTool } from "../src/tools/command.ts";

const ORIGINAL_TIMEOUT = process.env.FRACTAL_COMMAND_TIMEOUT_SECONDS;

afterEach(() => {
  if (ORIGINAL_TIMEOUT === undefined) {
    delete process.env.FRACTAL_COMMAND_TIMEOUT_SECONDS;
  } else {
    process.env.FRACTAL_COMMAND_TIMEOUT_SECONDS = ORIGINAL_TIMEOUT;
  }
});

describe("run_command containment", () => {
  test("removes secret-shaped environment variables from child processes", () => {
    const environment = buildCommandEnvironment({
      PATH: "/usr/bin",
      FRACTAL_SAFE_MARKER: "visible",
      OPENAI_API_KEY: "hidden",
      GITHUB_TOKEN: "hidden",
      DATABASE_PASSWORD: "hidden",
      SSH_AUTH_SOCK: "/tmp/agent.sock"
    });

    expect(environment).toEqual({
      PATH: "/usr/bin",
      FRACTAL_SAFE_MARKER: "visible"
    });
  });

  test(
    "terminates commands at the configured hard timeout",
    async () => {
      process.env.FRACTAL_COMMAND_TIMEOUT_SECONDS = "1";
      const startedAt = Date.now();

      const result = await runCommandTool({ command: "sleep 5" });

      expect(result.code).not.toBe(0);
      expect(Date.now() - startedAt).toBeLessThan(3_000);
    },
    5_000
  );
});
