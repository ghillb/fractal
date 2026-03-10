import { describe, expect, test } from "bun:test";
import { canUsePlanMode, listChangedFilesFromStatus } from "../src/evolve/cycle.ts";

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
        hnSignal: []
      })
    ).toBe(false);
  });
});
