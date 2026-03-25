import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseMachineReadableBlocks,
  validateMachineReadableBlock,
  type JournalMachineReadableBlock
} from "../src/evolve/journal-validator";
import {
  buildJournalMachineReadablePayload,
  serializeJournalMachineReadablePayload,
  validateJournalMachineReadablePayload
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
});
