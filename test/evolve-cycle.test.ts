import { describe, expect, test } from "bun:test";
import {
  canUsePlanMode,
  listChangedFilesFromStatus,
  shouldApplyHotFilePressure
} from "../src/evolve/cycle.ts";
import { summarizeRecentHotFilesFromHistory } from "../src/evolve/observe.ts";

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
});
