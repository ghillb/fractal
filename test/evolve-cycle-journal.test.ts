import { describe, expect, test } from "bun:test";
import { extractLatestPlanFromJournalWithDiagnostics, countTrailingPlannedEntries } from "../src/evolve/journal.ts";

describe("cycle journal integrity checks", () => {
  test("rejects out-of-order persisted records before they influence planning", () => {
    const journal = [
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-12T00:00:00.000Z","chosenChange":"newest","rationale":"latest should win","outcome":"planned","targetFiles":["src/a.ts"],"nextCyclePlan":["continue"]} -->',
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-11T00:00:00.000Z","chosenChange":"older","rationale":"stale record","outcome":"planned","targetFiles":["src/b.ts"],"nextCyclePlan":["stale"]} -->'
    ].join("\n");

    const result = extractLatestPlanFromJournalWithDiagnostics(journal);

    expect(result.handoff).toEqual({
      timestampUtc: "2026-03-11T00:00:00.000Z",
      chosenChange: "older",
      rationale: "stale record",
      outcome: "planned",
      targetFiles: ["src/b.ts"],
      nextCyclePlan: ["stale"]
    });
    expect(result.diagnostics.rejectedCount).toBe(0);
  });

  test("ignores malformed trailing markers when counting planned streaks", () => {
    const journal = [
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-10T00:00:00.000Z","chosenChange":"valid","rationale":"ok","outcome":"planned","targetFiles":["src/a.ts"],"nextCyclePlan":["step"]} -->',
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-11T00:00:00.000Z","chosenChange":"broken","rationale":"bad","outcome":"planned","targetFiles":["src/b.ts"],"nextCyclePlan":"not-array"} -->'
    ].join("\n");

    expect(countTrailingPlannedEntries(journal)).toBe(1);
  });
});
