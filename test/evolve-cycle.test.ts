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
  discoverEvolveCapabilityDescriptor,
  discoverJournalCapabilities,
  listChangedFilesFromStatus,
  shouldApplyHotFilePressure,
  summarizeJournalCapabilities
} from "../src/evolve/cycle.ts";
import { deriveCycleStatus } from "../src/evolve/journal-validator.ts";
import { serializeJournalMachineReadablePayload, CYCLE_STATUS_INSPECTION_CAPABILITY } from "../src/evolve/journal-schema.ts";
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

  test("normalizes journal capability metadata into a stable summary object", () => {
    expect(summarizeJournalCapabilities("committed")).toEqual({
      cycleStatus: "ok",
      capabilities: [CYCLE_STATUS_INSPECTION_CAPABILITY]
    });

    const summary = summarizeJournalCapabilities("planned", [
      CYCLE_STATUS_INSPECTION_CAPABILITY,
      CYCLE_STATUS_INSPECTION_CAPABILITY
    ]);
    const roundTrip = JSON.parse(JSON.stringify(summary)) as typeof summary;

    expect(roundTrip).toEqual({
      cycleStatus: "no-op",
      capabilities: [CYCLE_STATUS_INSPECTION_CAPABILITY]
    });
    expect(roundTrip.capabilities).toHaveLength(1);
  });

  test("discovers a stable, versioned machine-readable descriptor for journal metadata", () => {
    const descriptor = discoverJournalCapabilities({
      timestampUtc: "2026-03-22T00:00:00.000Z",
      outcome: "committed",
      chosenChange: "add journal capability discovery",
      rationale: "expose read-only descriptor",
      targetFiles: ["src/evolve/cycle.ts"],
      nextCyclePlan: [],
      blockingReason: undefined
    });
    const roundTrip = JSON.parse(JSON.stringify(descriptor)) as typeof descriptor;

    expect(roundTrip).toEqual({
      timestampUtc: "2026-03-22T00:00:00.000Z",
      chosenChange: "add journal capability discovery",
      rationale: "expose read-only descriptor",
      outcome: "committed",
      targetFiles: ["src/evolve/cycle.ts"],
      nextCyclePlan: [],
      cycleStatus: "ok",
      capabilities: [CYCLE_STATUS_INSPECTION_CAPABILITY]
    });
    expect(Object.keys(roundTrip)).toEqual([
      "timestampUtc",
      "chosenChange",
      "rationale",
      "outcome",
      "targetFiles",
      "nextCyclePlan",
      "cycleStatus",
      "capabilities"
    ]);
    expect(roundTrip.capabilities).toEqual([CYCLE_STATUS_INSPECTION_CAPABILITY]);
    expect(roundTrip).not.toHaveProperty("blockingReason");
  });


  test("discovers a versioned persisted journal capability descriptor with stable round-trip shape", () => {
    const descriptor = discoverEvolveCapabilityDescriptor([
      {
        timestampUtc: "2026-03-24T03:00:00.000Z",
        outcome: "committed",
        targetFiles: ["src/evolve/cycle.ts"]
      },
      {
        timestampUtc: "2026-03-23T02:00:00.000Z",
        outcome: "planned",
        targetFiles: ["test/evolve-cycle.test.ts", "src/evolve/journal.ts"]
      }
    ]);
    const roundTrip = JSON.parse(JSON.stringify(descriptor)) as typeof descriptor;

    expect(roundTrip).toEqual({
      version: 1,
      source: "persisted-evolve-journal",
      entryCount: 2,
      latestTimestampUtc: "2026-03-24T03:00:00.000Z",
      latestOutcome: "committed",
      latestTargetFiles: ["src/evolve/cycle.ts"],
      capabilityNames: [
        "outcome:committed",
        "outcome:planned",
        "persisted-evolve-journal",
        "target:src/evolve/cycle.ts",
        "target:src/evolve/journal.ts",
        "target:test/evolve-cycle.test.ts"
      ]
    });
    expect(Object.keys(roundTrip)).toEqual([
      "version",
      "source",
      "entryCount",
      "latestTimestampUtc",
      "latestOutcome",
      "latestTargetFiles",
      "capabilityNames"
    ]);
  });

  test("emits a stable capability marker alongside cycle status in journal payloads", () => {
    const payload = JSON.parse(
      serializeJournalMachineReadablePayload({
        timestampUtc: "2026-03-22T00:00:00.000Z",
        mode: "real",
        goal: "goal",
        chosenChange: "change",
        rationale: "rationale",
        outcome: "committed",
        targetFiles: ["src/evolve/cycle.ts"],
        filesTouched: ["src/evolve/cycle.ts"],
        lintOutcome: "pass",
        testOutcome: "pass",
        followUps: [],
        nextCyclePlan: []
      })
    ) as { capabilities?: string[]; cycleStatus?: string };

    expect(payload.capabilities).toEqual([CYCLE_STATUS_INSPECTION_CAPABILITY]);
    expect(payload.cycleStatus).toBe("ok");
    expect(JSON.stringify(payload)).toContain(`"capabilities":["${CYCLE_STATUS_INSPECTION_CAPABILITY}"]`);
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
