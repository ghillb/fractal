import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  countTrailingPlannedEntries,
  extractLatestPlanFromJournalWithDiagnostics,
  getJournalCapabilityDescriptor,
  JOURNAL_CAPABILITY_DESCRIPTOR
} from "../src/evolve/journal";
import {
  parseMachineReadableBlocks,
  validateMachineReadableBlock,
  type JournalMachineReadableBlock
} from "../src/evolve/journal-validator";
import {
  buildJournalMachineReadablePayload,
  serializeJournalMachineReadablePayload,
  validateJournalMachineReadablePayload,
  validateJournalPlanHandoff
} from "../src/evolve/journal-schema";

const JOURNAL_PATH = join(import.meta.dir, "..", "JOURNAL.md");

function expectValidMachineReadableBlock(
  payload: unknown
): asserts payload is JournalMachineReadableBlock {
  expect(validateJournalMachineReadablePayload(payload)).toBeUndefined();
}

describe("persisted evolve journal machine-readable history", () => {
  test("all FRACTAL_ENTRY and handoff_json blocks in JOURNAL.md are valid JSON with required fields", () => {
    const journal = readFileSync(JOURNAL_PATH, "utf8");
    const blocks = parseMachineReadableBlocks(journal);

    expect(blocks.length).toBeGreaterThan(0);

    for (const block of blocks) {
      expect(validateMachineReadableBlock(block)).toBeUndefined();
    }
  });


  test("journal capability descriptor is stable across a round trip and read-only", () => {
    const descriptor = getJournalCapabilityDescriptor();

    expect(descriptor).toEqual(JOURNAL_CAPABILITY_DESCRIPTOR);
    expect(JSON.parse(JSON.stringify(descriptor))).toEqual(JOURNAL_CAPABILITY_DESCRIPTOR);
    expect(descriptor).toMatchObject({ readOnly: true, schemaVersion: "1.0", module: "src/evolve/journal.ts" });
  });

  test("entry markers and handoff_json lines stay paired with identical payloads", () => {
    const journal = readFileSync(JOURNAL_PATH, "utf8");
    const blocks = parseMachineReadableBlocks(journal);
    let previousEntry: JournalMachineReadableBlock | undefined;

    for (const block of blocks) {
      expectValidMachineReadableBlock(block.payload);

      if (block.kind === "entry") {
        previousEntry = block.payload;
        continue;
      }

      expect(previousEntry, `handoff_json at JOURNAL.md:${block.markerLine} must follow a FRACTAL_ENTRY marker`).toBeDefined();
      const entryPayload = previousEntry!;
      expect(block.payload).toEqual(entryPayload);
      previousEntry = undefined;
    }
  });

  test("reports a clear validation failure for malformed machine-readable JSON payloads", () => {
    const malformedEntry = parseMachineReadableBlocks(
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"bad entry","rationale":"wrong next plan shape","outcome":"planned","targetFiles":["test/evolve-journal.test.ts"],"nextCyclePlan":"should be array"} -->'
    );
    const malformedHandoff = parseMachineReadableBlocks(
      '- handoff_json: {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"bad handoff","rationale":"wrong target files shape","outcome":"reverted","targetFiles":"test/evolve-journal.test.ts","nextCyclePlan":["fix schema"]}'
    );

    expect(malformedEntry).toHaveLength(1);
    expect(malformedHandoff).toHaveLength(1);

    const entryFailure = validateMachineReadableBlock(malformedEntry[0]!);
    const handoffFailure = validateMachineReadableBlock(malformedHandoff[0]!);

    expect(entryFailure).toBe("invalid entry block at JOURNAL.md:1: nextCyclePlan must be an array of strings");
    expect(handoffFailure).toBe("invalid handoff block at JOURNAL.md:1: targetFiles must be an array of strings");
  });

  test("write-boundary schema helpers build and serialize valid machine-readable payloads", () => {
    const payload = buildJournalMachineReadablePayload({
      timestampUtc: "2026-03-22T00:00:00.000Z",
      mode: "real",
      goal: "goal",
      chosenChange: "add validation",
      rationale: "safer persisted history",
      outcome: "planned",
      targetFiles: ["src/evolve/journal.ts"],
      filesTouched: ["src/evolve/journal.ts"],
      lintOutcome: "pass",
      testOutcome: "pass",
      followUps: [],
      nextCyclePlan: ["add focused tests"],
      blockingReason: "waiting on implementation"
    });

    expect(validateJournalMachineReadablePayload(payload)).toBeUndefined();
    expect(JSON.parse(serializeJournalMachineReadablePayload({
      timestampUtc: "2026-03-22T00:00:00.000Z",
      mode: "real",
      goal: "goal",
      chosenChange: "add validation",
      rationale: "safer persisted history",
      outcome: "planned",
      targetFiles: ["src/evolve/journal.ts"],
      filesTouched: ["src/evolve/journal.ts"],
      lintOutcome: "pass",
      testOutcome: "pass",
      followUps: [],
      nextCyclePlan: ["add focused tests"],
      blockingReason: "waiting on implementation"
    }))).toEqual(payload);
  });

  test("write-boundary schema helpers reject malformed required fields before append", () => {
    expect(() =>
      serializeJournalMachineReadablePayload({
        timestampUtc: "2026-03-22T00:00:00.000Z",
        mode: "real",
        goal: "goal",
        chosenChange: "add validation",
        rationale: "safer persisted history",
        outcome: "planned",
        targetFiles: ["src/evolve/journal.ts"],
        filesTouched: [],
        lintOutcome: "pass",
        testOutcome: "pass",
        followUps: [],
        nextCyclePlan: [123 as never],
        blockingReason: "waiting on implementation"
      })
    ).toThrow("Invalid evolve journal payload: nextCyclePlan must be an array of strings");
  });

  test("read-side validation accepts historical committed entries with or without nextCyclePlan by normalizing them into planned handoffs", () => {
    const journalWithNextSteps = [
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"broken json" -->',
      '- handoff_json: {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"bad shape","rationale":"missing plan","outcome":"planned","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":[]}',
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-23T00:00:00.000Z","chosenChange":"recover historical entry","rationale":"legacy committed entries still carry useful next steps","outcome":"committed","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":["continue safely"]} -->'
    ].join("\n");
    const journalWithoutNextSteps = [
      '- handoff_json: {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"bad shape","rationale":"missing plan","outcome":"planned","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":[]}',
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-24T00:00:00.000Z","chosenChange":"recover legacy committed entry","rationale":"historical committed records should still be consumable","outcome":"committed","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":[]} -->'
    ].join("\n");

    const result = extractLatestPlanFromJournalWithDiagnostics(journalWithNextSteps);
    const legacyResult = extractLatestPlanFromJournalWithDiagnostics(journalWithoutNextSteps);

    expect(result.handoff).toEqual({
      timestampUtc: "2026-03-23T00:00:00.000Z",
      chosenChange: "recover historical entry",
      rationale: "legacy committed entries still carry useful next steps",
      outcome: "planned",
      targetFiles: ["src/evolve/journal.ts"],
      nextCyclePlan: ["continue safely"]
    });
    expect(legacyResult.handoff).toEqual({
      timestampUtc: "2026-03-24T00:00:00.000Z",
      chosenChange: "recover legacy committed entry",
      rationale: "historical committed records should still be consumable",
      outcome: "planned",
      targetFiles: ["src/evolve/journal.ts"],
      nextCyclePlan: []
    });
    expect(result.diagnostics).toEqual({
      rejectedCount: 0,
      rejectionSummary: []
    });
  });

  test("read-side diagnostics summarize only truly malformed entries when no valid handoff is found", () => {
    const journal = [
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"broken json" -->',
      '- handoff_json: {"timestampUtc":"2026-03-22T00:00:00.000Z","chosenChange":"bad shape","rationale":"missing plan","outcome":"planned","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":[]}',
      '- handoff_json: {"timestampUtc":"2026-03-22T01:00:00.000Z","chosenChange":"still malformed","rationale":"wrong next plan type","outcome":"committed","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":"ignored"}'
    ].join("\n");

    const result = extractLatestPlanFromJournalWithDiagnostics(journal);

    expect(result.handoff).toBeUndefined();
    expect(result.diagnostics.rejectedCount).toBe(3);
    expect(result.diagnostics.rejectionSummary).toEqual([
      'marker payload must be valid JSON (1)',
      'nextCyclePlan must be an array of strings (1)',
      'nextCyclePlan must contain at least one step for handoff consumption (1)'
    ]);
  });

  test("countTrailingPlannedEntries ignores malformed persisted markers", () => {
    const journal = [
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-20T00:00:00.000Z","chosenChange":"valid","rationale":"usable","outcome":"planned","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":["keep going"]} -->',
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-21T00:00:00.000Z","chosenChange":"invalid trailing","rationale":"broken plan","outcome":"planned","targetFiles":["src/evolve/journal.ts"],"nextCyclePlan":[]} -->'
    ].join("\n");

    expect(countTrailingPlannedEntries(journal)).toBe(1);
  });

  test("handoff validator accepts committed outcomes with empty nextCyclePlan but still rejects empty planned handoffs", () => {
    expect(
      validateJournalPlanHandoff({
        timestampUtc: "2026-03-22T00:00:00.000Z",
        chosenChange: "recover historical handoff",
        rationale: "committed should still be consumable",
        outcome: "committed",
        targetFiles: ["src/evolve/journal.ts"],
        nextCyclePlan: []
      })
    ).toEqual({
      ok: true,
      value: {
        timestampUtc: "2026-03-22T00:00:00.000Z",
        chosenChange: "recover historical handoff",
        rationale: "committed should still be consumable",
        outcome: "planned",
        targetFiles: ["src/evolve/journal.ts"],
        nextCyclePlan: []
      }
    });

    expect(
      validateJournalPlanHandoff({
        timestampUtc: "2026-03-22T00:00:00.000Z",
        chosenChange: "reject empty planned handoff",
        rationale: "planned entries must keep actionable next steps",
        outcome: "planned",
        targetFiles: ["src/evolve/journal.ts"],
        nextCyclePlan: []
      })
    ).toEqual({
      ok: false,
      reason: "nextCyclePlan must contain at least one step for handoff consumption"
    });
  });
});
