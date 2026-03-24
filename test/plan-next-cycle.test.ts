import { describe, expect, test } from "bun:test";
import { buildPlannerRecentCycleSummary } from "../src/evolve/observe.ts";

describe("plan next cycle context assembly", () => {
  test("returns normalized recent cycle entries with only planner-safe fields", () => {
    const [entry] = buildPlannerRecentCycleSummary([
      {
        timestampUtc: "2026-03-24T05:00:00.000Z",
        chosenChange: "Normalize planner context",
        rationale: "reduce volatility",
        outcome: "planned",
        targetFiles: ["src/evolve/observe.ts"],
        nextCyclePlan: ["add regression coverage"],
        blockingReason: "waiting on bounded follow-up",
        failureNote: "should not leak",
        filesTouched: ["secret.ts"],
        lintOutcome: "fail",
        testOutcome: "fail",
        followUps: ["hidden"]
      } as never
    ]);

    expect(entry).toEqual({
      timestampUtc: "2026-03-24T05:00:00.000Z",
      chosenChange: "Normalize planner context",
      rationale: "reduce volatility",
      outcome: "planned",
      targetFiles: ["src/evolve/observe.ts"],
      nextCyclePlan: ["add regression coverage"],
      blockingReason: "waiting on bounded follow-up"
    });
    expect(Object.keys(entry).sort()).toEqual([
      "blockingReason",
      "chosenChange",
      "nextCyclePlan",
      "outcome",
      "rationale",
      "targetFiles",
      "timestampUtc"
    ]);
  });
});
