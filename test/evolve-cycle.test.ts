import { describe, expect, test } from "bun:test";
import {
  buildPlannerHnSignal,
  buildPlannerJournalIntegrity,
  buildPlannerLatestCycleHandoff,
  buildPlannerRecentCycleSummary,
  summarizeRecentHotFilesFromHistory
} from "../src/evolve/observe.ts";
import {
  canUsePlanMode,
  listChangedFilesFromStatus,
  shouldApplyHotFilePressure
} from "../src/evolve/cycle.ts";
import { deriveCycleStatus } from "../src/evolve/journal-validator.ts";
import { assertWorkflowSelectionPrecedence, buildWorkflowRoutingAudit, getWorkflowDecisionReason, selectEvolveWorkflow } from "../src/evolve/workflows.ts";

describe("evolve cycle change detection", () => {
  test("treats untracked files as pending changes", () => {
    expect(listChangedFilesFromStatus("?? test/journal-schema.test.ts\n")).toEqual([
      "test/journal-schema.test.ts"
    ]);
  });

  test("returns normalized paths for mixed git status entries", () => {
    const statusOutput = [
      " M src/evolve/cycle.ts",
      "A  test/evolve-cycle.test.ts",
      "R  src/old-name.ts -> src/new-name.ts",
      "?? test/journal-schema.test.ts",
      " M src/evolve/cycle.ts"
    ].join("\n");

    expect(listChangedFilesFromStatus(statusOutput)).toEqual([
      "src/evolve/cycle.ts",
      "test/evolve-cycle.test.ts",
      "src/new-name.ts",
      "test/journal-schema.test.ts"
    ]);
  });

  test("emits a minimal decision reason code for task routing", () => {
    expect(
      getWorkflowDecisionReason({
        issues: [],
        commits: [],
        journalTail: "",
        consecutivePlanCount: 1,
        latestPlan: undefined,
        latestCycleOutcome: undefined,
        latestCycleTargetFiles: [],
        latestCycleFinished: undefined,
        latestCycleUnfinished: undefined,
        latestCycleCompletionSummary: undefined,
        journalIntegrity: { rejectedHistoricalEntryCount: 0 },
        repositoryActivity: {
          active: false,
          distinctFilesTouched: 0,
          recentChangeStreak: 0,
          freshnessScore: 0,
          freshnessLabel: "idle",
          activityHint: "idle",
          freshEnoughForPlanning: false
        },
        recentCycleSummary: [],
        recentHotFiles: [],
        hnSignal: []
      })
    ).toBe("consecutive-plan-guard");
  });

  test("derives a stable cycle status code from journal outcomes", () => {
    expect(deriveCycleStatus("committed")).toBe("ok");
    expect(deriveCycleStatus("planned")).toBe("no-op");
    expect(deriveCycleStatus("reverted")).toBe("failed");
  });

  test("allows only one consecutive planning cycle", () => {
    expect(
      canUsePlanMode({
        issues: [],
        commits: [],
        journalTail: "",
        consecutivePlanCount: 0,
        latestPlan: undefined,
        latestCycleOutcome: undefined,
        latestCycleTargetFiles: [],
        latestCycleFinished: undefined,
        latestCycleUnfinished: undefined,
        latestCycleCompletionSummary: undefined,
        journalIntegrity: { rejectedHistoricalEntryCount: 0 },
        repositoryActivity: {
          active: false,
          distinctFilesTouched: 0,
          recentChangeStreak: 0,
          freshnessScore: 0,
          freshnessLabel: "idle",
          activityHint: "idle",
          freshEnoughForPlanning: false
        },
        recentCycleSummary: [],
        recentHotFiles: [],
        hnSignal: []
      })
    ).toBe(true);

    expect(
      canUsePlanMode({
        issues: [],
        commits: [],
        journalTail: "",
        consecutivePlanCount: 1,
        latestPlan: {
          timestampUtc: "2026-03-13T00:37:36.260Z",
          chosenChange: "Add a single regression test file",
          rationale: "bounded",
          outcome: "planned",
          targetFiles: ["test/journal-schema.test.ts"],
          blockingReason: "need one cycle of planning",
          nextCyclePlan: ["find schema module"]
        },
        latestCycleOutcome: "planned",
        latestCycleTargetFiles: ["test/journal-schema.test.ts"],
        latestCycleFinished: false,
        latestCycleUnfinished: true,
        latestCycleCompletionSummary: "unfinished; outcome=planned; targetFiles=test/journal-schema.test.ts",
        journalIntegrity: { rejectedHistoricalEntryCount: 0 },
        repositoryActivity: {
          active: false,
          distinctFilesTouched: 0,
          recentChangeStreak: 0,
          freshnessScore: 0,
          freshnessLabel: "idle",
          activityHint: "idle",
          freshEnoughForPlanning: false
        },
        recentCycleSummary: [],
        recentHotFiles: [],
        hnSignal: []
      })
    ).toBe(false);
  });

  test("exposes workflow routing audit with reason and match state", () => {
    expect(
      buildWorkflowRoutingAudit(
        {
          issues: [],
          commits: [],
          journalTail: "",
          consecutivePlanCount: 0,
          latestPlan: undefined,
          latestCycleOutcome: undefined,
          latestCycleTargetFiles: [],
          latestCycleFinished: undefined,
          latestCycleUnfinished: undefined,
          latestCycleCompletionSummary: undefined,
          journalIntegrity: { rejectedHistoricalEntryCount: 1 },
          repositoryActivity: {
            active: true,
            distinctFilesTouched: 2,
            recentChangeStreak: 1,
            freshnessScore: 1,
            freshnessLabel: "active",
            activityHint: "active",
            freshEnoughForPlanning: true
          },
          recentCycleSummary: [],
          recentHotFiles: [],
          hnSignal: []
        },
        "task"
      )
    ).toEqual({
      requestedKind: "task",
      selectedKind: "meta",
      reason: "journal integrity noise indicates meta workflow is safer",
      validated: true,
      matched: false,
      decisionReason: "meta-signals"
    });
  });

  test("rejects task requests when meta selection takes precedence from evolve state", () => {
    expect(() =>
      assertWorkflowSelectionPrecedence(
        {
          issues: [],
          commits: [],
          journalTail: "",
          consecutivePlanCount: 0,
          latestPlan: undefined,
          latestCycleOutcome: undefined,
          latestCycleTargetFiles: [],
          latestCycleFinished: undefined,
          latestCycleUnfinished: undefined,
          latestCycleCompletionSummary: undefined,
          journalIntegrity: { rejectedHistoricalEntryCount: 1 },
          repositoryActivity: {
            active: true,
            distinctFilesTouched: 2,
            recentChangeStreak: 1,
            freshnessScore: 1,
            freshnessLabel: "active",
            activityHint: "active",
            freshEnoughForPlanning: true
          },
          recentCycleSummary: [],
          recentHotFiles: [],
          hnSignal: []
        },
        "task"
      )
    ).toThrow("Workflow selection mismatch: requested task, selected meta (meta-signals)");
  });

  test("prefers task workflow when planning is already consecutive even with meta signals", () => {
    expect(
      selectEvolveWorkflow({
        issues: [{ title: "triage" } as never],
        commits: [],
        journalTail: "",
        consecutivePlanCount: 1,
        latestPlan: undefined,
        latestCycleOutcome: undefined,
        latestCycleTargetFiles: [],
        latestCycleFinished: undefined,
        latestCycleUnfinished: undefined,
        latestCycleCompletionSummary: undefined,
        journalIntegrity: { rejectedHistoricalEntryCount: 1 },
        repositoryActivity: {
          active: true,
          distinctFilesTouched: 2,
          recentChangeStreak: 1,
          freshnessScore: 1,
          freshnessLabel: "active",
          activityHint: "active",
          freshEnoughForPlanning: true
        },
        recentCycleSummary: [],
        recentHotFiles: [],
        hnSignal: []
      }).kind
    ).toBe("task");
  });

  test("applies hot-file pressure most of the time", () => {
    expect(shouldApplyHotFilePressure(0)).toBe(true);
    expect(shouldApplyHotFilePressure(0.84)).toBe(true);
    expect(shouldApplyHotFilePressure(0.85)).toBe(false);
    expect(shouldApplyHotFilePressure(0.99)).toBe(false);
  });

  test("summarizes repeated recent files from git history", () => {
    const history = [
      "JOURNAL.md",
      "src/core/fs-guard.ts",
      "test/fs-guard.test.ts",
      "",
      "JOURNAL.md",
      "src/core/fs-guard.ts",
      "",
      "src/core/fs-guard.ts",
      "src/evolve/cycle.ts"
    ].join("\n");

    expect(summarizeRecentHotFilesFromHistory(history)).toEqual(["src/core/fs-guard.ts"]);
  });

  test("caps planner recent cycle summary and keeps a stable field shape", () => {
    const summary = buildPlannerRecentCycleSummary([
      {
        timestampUtc: "2026-03-24T03:00:00.000Z",
        chosenChange: "third",
        rationale: "latest",
        outcome: "committed",
        targetFiles: ["src/c.ts"],
        nextCyclePlan: [],
        blockingReason: ""
      },
      {
        timestampUtc: "2026-03-24T02:00:00.000Z",
        chosenChange: "second",
        rationale: "middle",
        outcome: "planned",
        targetFiles: ["src/b.ts"],
        nextCyclePlan: ["follow up"],
        blockingReason: "waiting"
      },
      {
        timestampUtc: "2026-03-24T01:00:00.000Z",
        chosenChange: "first",
        rationale: "older",
        outcome: "reverted",
        targetFiles: ["src/a.ts"],
        nextCyclePlan: [],
        blockingReason: undefined
      },
      {
        timestampUtc: "2026-03-24T00:00:00.000Z",
        chosenChange: "discarded",
        rationale: "too old",
        outcome: "committed",
        targetFiles: ["src/old.ts"],
        nextCyclePlan: ["should not appear"],
        blockingReason: "old"
      }
    ]);

    expect(summary).toEqual([
      {
        timestampUtc: "2026-03-24T03:00:00.000Z",
        chosenChange: "third",
        rationale: "latest",
        outcome: "committed",
        targetFiles: ["src/c.ts"],
        nextCyclePlan: []
      },
      {
        timestampUtc: "2026-03-24T02:00:00.000Z",
        chosenChange: "second",
        rationale: "middle",
        outcome: "planned",
        targetFiles: ["src/b.ts"],
        nextCyclePlan: ["follow up"],
        blockingReason: "waiting"
      },
      {
        timestampUtc: "2026-03-24T01:00:00.000Z",
        chosenChange: "first",
        rationale: "older",
        outcome: "reverted",
        targetFiles: ["src/a.ts"],
        nextCyclePlan: []
      }
    ]);
    expect(summary[0]).not.toHaveProperty("failureNote");
    expect(summary[0]).not.toHaveProperty("filesTouched");
    expect(summary[0]).not.toHaveProperty("lintOutcome");
    expect(summary[0]).not.toHaveProperty("testOutcome");
    expect(summary).toHaveLength(3);
  });

  test("returns bounded latest cycle handoff for planner mismatch detection", () => {
    const handoff = buildPlannerLatestCycleHandoff([
      {
        timestampUtc: "2026-03-24T03:00:00.000Z",
        chosenChange: "implemented latest work",
        rationale: "latest",
        outcome: "committed",
        targetFiles: [
          "src/evolve/observe.ts",
          "src/evolve/types.ts",
          "test/plan-next-cycle.test.ts",
          "test/evolve-cycle.test.ts",
          "src/extra-a.ts",
          "src/extra-b.ts"
        ],
        nextCyclePlan: ["hidden"],
        blockingReason: "hidden",
        failureNote: "hidden"
      } as never,
      {
        timestampUtc: "2026-03-24T02:00:00.000Z",
        chosenChange: "older",
        rationale: "older",
        outcome: "planned",
        targetFiles: ["src/older.ts"],
        nextCyclePlan: [],
        blockingReason: "older"
      }
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
  });

  test("exposes a stable cycle status code in planner readouts", () => {
    expect(buildPlannerJournalIntegrity({ rejectedCount: 0, rejectionSummary: [] }).rejectedHistoricalEntryCount).toBe(0);
    expect(deriveCycleStatus("committed")).toBe("ok");
    expect(deriveCycleStatus("planned")).toBe("no-op");
    expect(deriveCycleStatus("reverted")).toBe("failed");
  });
});
