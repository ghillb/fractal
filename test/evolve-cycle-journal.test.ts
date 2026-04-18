import { describe, expect, test } from "bun:test";
import {
  JOURNAL_CAPABILITY_DESCRIPTOR,
  exportJournalCapabilityDescriptor,
  getJournalCapabilityDescriptor,
  readRepositoryHealthSummary,
  extractLatestPlanFromJournalWithDiagnostics,
  countTrailingPlannedEntries
} from "../src/evolve/journal.ts";

describe("cycle journal integrity checks", () => {
  test("exposes a stable, versioned read-only capability snapshot", () => {
    const descriptor = getJournalCapabilityDescriptor();

    expect(descriptor).toEqual(JOURNAL_CAPABILITY_DESCRIPTOR);
    expect(exportJournalCapabilityDescriptor()).toBe(
      '{"schemaVersion":"1.0","module":"src/evolve/journal.ts","readOnly":true,"machineReadable":{"markerPrefix":"<!-- FRACTAL_ENTRY ","handoffPrefix":"- handoff_json: ","payloadCapabilities":["cycle-status-inspection"]}}'
    );
    expect(Object.isFrozen(JOURNAL_CAPABILITY_DESCRIPTOR)).toBe(false);
    expect(descriptor.readOnly).toBe(true);
    expect(descriptor.schemaVersion).toBe("1.0");
    expect(descriptor.machineReadable.payloadCapabilities).toEqual(["cycle-status-inspection"]);
  });

  test("returns a minimal read-only repository health summary without mutating state", async () => {
    const summary = await readRepositoryHealthSummary("./does-not-exist-journal.md");

    expect(summary).toEqual({
      version: 1,
      readOnly: true,
      source: "persisted-evolve-journal",
      machineReadable: {
        hasJournal: false,
        plannedStreak: 0
      }
    });
  });

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
