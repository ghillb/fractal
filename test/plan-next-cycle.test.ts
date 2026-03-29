import { describe, expect, test } from "bun:test";
import {
  buildPlannerHnSignal,
  buildPlannerJournalIntegrity,
  buildPlannerLatestCycleHandoff,
  buildPlannerRecentCycleSummary
} from "../src/evolve/observe.ts";

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

  test("returns bounded latest cycle handoff fields only", () => {
    const handoff = buildPlannerLatestCycleHandoff([
      {
        timestampUtc: "2026-03-24T05:00:00.000Z",
        chosenChange: "Recently finished work",
        rationale: "improve planner awareness",
        outcome: "committed",
        targetFiles: [
          "src/evolve/observe.ts",
          "src/evolve/types.ts",
          "test/plan-next-cycle.test.ts",
          "test/evolve-cycle.test.ts",
          "src/extra-a.ts",
          "src/extra-b.ts"
        ],
        nextCyclePlan: ["should not leak"],
        blockingReason: "should not leak",
        failureNote: "hidden",
        filesTouched: ["hidden.ts"]
      } as never
    ]);

    expect(handoff).toEqual({
      outcome: "committed",
      targetFiles: [
        "src/evolve/observe.ts",
        "src/evolve/types.ts",
        "test/plan-next-cycle.test.ts",
        "test/evolve-cycle.test.ts",
        "src/extra-a.ts"
      ],
      finished: true,
      unfinished: false
    });
    expect(Object.keys(handoff ?? {}).sort()).toEqual(["finished", "outcome", "targetFiles", "unfinished"]);
  });

  test("derives latest planned cycle unfinished from latest plan and recent cycle data", () => {
    expect(
      buildPlannerJournalIntegrity({ rejectedCount: 0, rejectionSummary: [] })
    ).toEqual({ rejectedHistoricalEntryCount: 0 });
    const context = {
      issues: [],
      commits: [],
      journalTail: "",
      consecutivePlanCount: 1,
      latestPlan: {
        timestampUtc: "2026-03-24T05:00:00.000Z",
        chosenChange: "Plan a small follow-up",
        rationale: "bounded",
        outcome: "planned",
        targetFiles: ["src/evolve/observe.ts"],
        blockingReason: "wait one cycle",
        nextCyclePlan: ["finish the follow-up"]
      },
      latestCycleOutcome: "planned" as const,
      latestCycleTargetFiles: ["src/evolve/observe.ts"],
      latestCycleFinished: false,
      latestCycleUnfinished: true,
      latestCycleCompletionSummary: "unfinished; outcome=planned; targetFiles=src/evolve/observe.ts",
      latestPlannedCycleUnfinished: true,
      journalIntegrity: { rejectedHistoricalEntryCount: 0 },
      recentCycleSummary: [],
      recentHotFiles: [],
      hnSignal: []
    };

    expect(context.latestPlannedCycleUnfinished).toBe(true);
    expect(Object.keys(context).sort()).toContain("latestPlannedCycleUnfinished");
  });

  test("returns undefined latest cycle handoff when no recent entry exists", () => {
    expect(buildPlannerLatestCycleHandoff([])).toBeUndefined();
  });

  test("returns normalized bounded journal integrity metadata only", () => {
    const integrity = buildPlannerJournalIntegrity({
      rejectedCount: 2,
      rejectionSummary: [
        "marker payload must be valid JSON (1)",
        'outcome must be "planned" or "reverted" for handoff consumption (1)'
      ]
    });

    expect(integrity).toEqual({
      rejectedHistoricalEntryCount: 2,
      rejectionSummary: [
        "marker payload must be valid JSON (1)",
        'outcome must be "planned" or "reverted" for handoff consumption (1)'
      ]
    });
    expect(Object.keys(integrity).sort()).toEqual([
      "rejectedHistoricalEntryCount",
      "rejectionSummary"
    ]);
  });

  test("omits empty journal integrity summary field", () => {
    expect(
      buildPlannerJournalIntegrity({
        rejectedCount: 0,
        rejectionSummary: []
      })
    ).toEqual({
      rejectedHistoricalEntryCount: 0
    });
  });

  test("returns normalized hn signal entries with only stable planner-safe fields", () => {
    const [entry] = buildPlannerHnSignal([
      {
        title: "Useful post",
        url: "https://example.com/post",
        hn_url: "https://news.ycombinator.com/item?id=1",
        points: 321,
        comments: 45,
        author: "pg",
        created_at: "2026-03-24T05:00:00.000Z",
        objectID: "1",
        unexpected: ["leak"]
      }
    ]);

    expect(entry).toEqual({
      title: "Useful post",
      url: "https://example.com/post",
      hnUrl: "https://news.ycombinator.com/item?id=1",
      points: 321,
      comments: 45,
      author: "pg",
      createdAt: "2026-03-24T05:00:00.000Z"
    });
    expect(Object.keys(entry).sort()).toEqual([
      "author",
      "comments",
      "createdAt",
      "hnUrl",
      "points",
      "title",
      "url"
    ]);
  });
});
