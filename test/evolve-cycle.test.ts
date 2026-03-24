import { describe, expect, test } from "bun:test";
import {
  buildPlannerRecentCycleSummary,
  summarizeRecentHotFilesFromHistory
} from "../src/evolve/observe.ts";
import {
  canUsePlanMode,
  listChangedFilesFromStatus,
  shouldApplyHotFilePressure
} from "../src/evolve/cycle.ts";

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

  test("allows only one consecutive planning cycle", () => {
    expect(
      canUsePlanMode({
        issues: [],
        commits: [],
        journalTail: "",
        consecutivePlanCount: 0,
        latestPlan: undefined,
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
        recentCycleSummary: [],
        recentHotFiles: [],
        hnSignal: []
      })
    ).toBe(false);
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
});
