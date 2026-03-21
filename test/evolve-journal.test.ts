import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type ParsedJournalBlock = {
  markerLine: number;
  kind: "entry" | "handoff";
  payload: unknown;
};

type JournalMachineReadableBlock = {
  timestampUtc: string;
  chosenChange: string;
  rationale: string;
  outcome: "committed" | "planned" | "reverted";
  targetFiles: string[];
  nextCyclePlan: string[];
  blockingReason?: string;
};

const JOURNAL_PATH = join(import.meta.dir, "..", "JOURNAL.md");
const ENTRY_PREFIX = "<!-- FRACTAL_ENTRY ";
const ENTRY_SUFFIX = " -->";
const HANDOFF_PREFIX = "- handoff_json: ";

function parseMachineReadableBlocks(text: string): ParsedJournalBlock[] {
  const blocks: ParsedJournalBlock[] = [];

  for (const [index, rawLine] of text.split("\n").entries()) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith(ENTRY_PREFIX) && line.endsWith(ENTRY_SUFFIX)) {
      blocks.push({
        markerLine: index + 1,
        kind: "entry",
        payload: JSON.parse(line.slice(ENTRY_PREFIX.length, -ENTRY_SUFFIX.length))
      });
      continue;
    }

    if (line.startsWith(HANDOFF_PREFIX)) {
      blocks.push({
        markerLine: index + 1,
        kind: "handoff",
        payload: JSON.parse(line.slice(HANDOFF_PREFIX.length))
      });
    }
  }

  return blocks;
}

function expectValidMachineReadableBlock(
  block: ParsedJournalBlock
): asserts block is ParsedJournalBlock & { payload: JournalMachineReadableBlock } {
  expect(block.payload).toBeObject();
  const payload = block.payload as Record<string, unknown>;

  expect(typeof payload.timestampUtc).toBe("string");
  expect(payload.timestampUtc).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
  expect(typeof payload.chosenChange).toBe("string");
  expect(payload.chosenChange).not.toBe("");
  expect(typeof payload.rationale).toBe("string");
  expect(payload.rationale).not.toBe("");
  expect(["committed", "planned", "reverted"]).toContain(payload.outcome);
  expect(Array.isArray(payload.targetFiles)).toBe(true);
  expect((payload.targetFiles as unknown[]).every((item) => typeof item === "string")).toBe(true);
  expect(Array.isArray(payload.nextCyclePlan)).toBe(true);
  expect((payload.nextCyclePlan as unknown[]).every((item) => typeof item === "string")).toBe(true);

  if (payload.outcome === "planned" || payload.outcome === "reverted") {
    expect((payload.nextCyclePlan as unknown[]).length).toBeGreaterThan(0);
  }

  if (payload.blockingReason !== undefined) {
    expect(typeof payload.blockingReason).toBe("string");
    expect(payload.blockingReason).not.toBe("");
  }
}

describe("persisted evolve journal machine-readable history", () => {
  test("all FRACTAL_ENTRY and handoff_json blocks in JOURNAL.md are valid JSON with required fields", () => {
    const journal = readFileSync(JOURNAL_PATH, "utf8");
    const blocks = parseMachineReadableBlocks(journal);

    expect(blocks.length).toBeGreaterThan(0);

    for (const block of blocks) {
      expect(() => expectValidMachineReadableBlock(block), `invalid ${block.kind} block at JOURNAL.md:${block.markerLine}`).not.toThrow();
    }
  });

  test("entry markers and handoff_json lines stay paired with identical payloads", () => {
    const journal = readFileSync(JOURNAL_PATH, "utf8");
    const blocks = parseMachineReadableBlocks(journal);
    let previousEntry: JournalMachineReadableBlock | undefined;

    for (const block of blocks) {
      expectValidMachineReadableBlock(block);

      if (block.kind === "entry") {
        previousEntry = block.payload;
        continue;
      }

      expect(previousEntry, `handoff_json at JOURNAL.md:${block.markerLine} must follow a FRACTAL_ENTRY marker`).toBeDefined();
      expect(block.payload).toEqual(previousEntry);
      previousEntry = undefined;
    }
  });
});
