import { describe, expect, test } from "bun:test";
import { assertWithinAgentDeadline } from "../src/agent/runner.ts";

describe("agent cycle deadline", () => {
  test("permits work before the configured cycle deadline", () => {
    expect(() => assertWithinAgentDeadline(1_000, 10, 10_999)).not.toThrow();
  });

  test("stops work once the configured cycle deadline is reached", () => {
    expect(() => assertWithinAgentDeadline(1_000, 10, 11_000)).toThrow(
      "agent cycle time limit exceeded (10s)"
    );
  });
});
