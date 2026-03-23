import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  appendJournal,
  countTrailingPlannedEntries,
  extractLatestPlanFromJournal
} from "../src/evolve/journal.ts";
import { readRecentEvolveJournalSummary } from "../src/evolve/read-evolve-journal-summary.ts";

describe("journal", () => {
  test("appends structured entries", async () => {
    const cwd = process.cwd();
    const temp = mkdtempSync(join(tmpdir(), "fractal-journal-"));
    process.chdir(temp);

    try {
      await appendJournal({
        timestampUtc: "2026-03-07T00:00:00.000Z",
        mode: "dry-run",
        goal: "goal",
        chosenChange: "change",
        rationale: "why",
        outcome: "planned",
        targetFiles: ["src/example.ts"],
        filesTouched: ["a.ts"],
        lintOutcome: "pass",
        testOutcome: "pass",
        followUps: ["next"],
        nextCyclePlan: ["inspect src/example.ts", "add test"],
        blockingReason: "waiting on narrower implementation path"
      });

      const content = await readFile(join(temp, "JOURNAL.md"), "utf8");
      expect(content.includes("<!-- FRACTAL_ENTRY {")).toBe(true);
      expect(content.includes("timestamp_utc: 2026-03-07T00:00:00.000Z")).toBe(true);
      expect(content.includes("files_touched: a.ts")).toBe(true);
      expect(content.includes("outcome: planned")).toBe(true);
      expect(content.includes("target_files: src/example.ts")).toBe(true);
      expect(content.includes("next_cycle_plan: inspect src/example.ts | add test")).toBe(true);
      expect(content.includes("- handoff_json: {")).toBe(true);

      const latestPlan = extractLatestPlanFromJournal(content);
      expect(latestPlan).toEqual({
        timestampUtc: "2026-03-07T00:00:00.000Z",
        chosenChange: "change",
        rationale: "why",
        outcome: "planned",
        targetFiles: ["src/example.ts"],
        blockingReason: "waiting on narrower implementation path",
        nextCyclePlan: ["inspect src/example.ts", "add test"]
      });
    } finally {
      process.chdir(cwd);
    }
  });

  test("rejects invalid machine-readable payloads before writing JOURNAL.md", async () => {
    const cwd = process.cwd();
    const temp = mkdtempSync(join(tmpdir(), "fractal-journal-"));
    process.chdir(temp);

    try {
      await expect(
        appendJournal({
          timestampUtc: "2026-03-07T00:00:00.000Z",
          mode: "real",
          goal: "goal",
          chosenChange: "change",
          rationale: "why",
          outcome: "planned",
          targetFiles: ["src/example.ts"],
          filesTouched: [],
          lintOutcome: "skipped",
          testOutcome: "skipped",
          followUps: [],
          nextCyclePlan: [123 as never],
          blockingReason: "waiting on narrower implementation path"
        })
      ).rejects.toThrow("Invalid evolve journal payload: nextCyclePlan must be an array of strings");
    } finally {
      process.chdir(cwd);
    }
  });

  test("counts trailing planned entries only once a non-plan breaks the streak", () => {
    const journal = [
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-10T00:00:00.000Z\",\"chosenChange\":\"a\",\"rationale\":\"r\",\"outcome\":\"planned\",\"targetFiles\":[],\"nextCyclePlan\":[\"x\"]} -->",
      "## Entry 2026-03-10T00:00:00.000Z",
      "- outcome: planned",
      "",
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-10T08:00:00.000Z\",\"chosenChange\":\"b\",\"rationale\":\"r\",\"outcome\":\"planned\",\"targetFiles\":[],\"nextCyclePlan\":[\"x\"]} -->",
      "## Entry 2026-03-10T08:00:00.000Z",
      "- outcome: planned",
      "",
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-10T16:00:00.000Z\",\"chosenChange\":\"c\",\"rationale\":\"r\",\"outcome\":\"reverted\",\"targetFiles\":[],\"nextCyclePlan\":[\"x\"]} -->",
      "## Entry 2026-03-10T16:00:00.000Z",
      "- outcome: committed",
      "",
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-11T00:00:00.000Z\",\"chosenChange\":\"d\",\"rationale\":\"r\",\"outcome\":\"planned\",\"targetFiles\":[],\"nextCyclePlan\":[\"x\"]} -->",
      "## Entry 2026-03-11T00:00:00.000Z",
      "- outcome: planned"
    ].join("\n");

    expect(countTrailingPlannedEntries(journal)).toBe(1);
  });

  test("extracts latest plan from marker even when markdown body is incomplete", () => {
    const journal = [
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-11T00:00:00.000Z\",\"chosenChange\":\"older\",\"rationale\":\"r\",\"outcome\":\"planned\",\"targetFiles\":[\"a.ts\"],\"nextCyclePlan\":[\"step\"]} -->",
      "## Entry 2026-03-11T00:00:00.000Z",
      "- outcome: planned",
      "",
      "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-12T00:00:00.000Z\",\"chosenChange\":\"newer\",\"rationale\":\"why\",\"outcome\":\"planned\",\"targetFiles\":[\"src/example.ts\"],\"blockingReason\":\"need one cycle\",\"nextCyclePlan\":[\"inspect src/example.ts\"]} -->",
      "## Entry 2026-03-12T00:00:00.000Z"
    ].join("\n");

    expect(extractLatestPlanFromJournal(journal)).toEqual({
      timestampUtc: "2026-03-12T00:00:00.000Z",
      chosenChange: "newer",
      rationale: "why",
      outcome: "planned",
      targetFiles: ["src/example.ts"],
      blockingReason: "need one cycle",
      nextCyclePlan: ["inspect src/example.ts"]
    });
  });

  test("reads recent validated FRACTAL_ENTRY summaries in reverse chronological order", async () => {
    const temp = mkdtempSync(join(tmpdir(), "fractal-journal-"));
    const journalPath = join(temp, "JOURNAL.md");
    writeFileSync(
      journalPath,
      [
        "# JOURNAL",
        "",
        "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-10T00:00:00.000Z\",\"chosenChange\":\"a\",\"rationale\":\"why a\",\"outcome\":\"planned\",\"targetFiles\":[\"a.ts\"],\"nextCyclePlan\":[\"step a\"]} -->",
        "- handoff_json: {\"timestampUtc\":\"2026-03-10T00:00:00.000Z\",\"chosenChange\":\"a\",\"rationale\":\"why a\",\"outcome\":\"planned\",\"targetFiles\":[\"a.ts\"],\"nextCyclePlan\":[\"step a\"]}",
        "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-11T00:00:00.000Z\",\"chosenChange\":\"b\",\"rationale\":\"why b\",\"outcome\":\"committed\",\"targetFiles\":[\"b.ts\"],\"nextCyclePlan\":[\"step b\"]} -->",
        "- handoff_json: {\"timestampUtc\":\"2026-03-11T00:00:00.000Z\",\"chosenChange\":\"b\",\"rationale\":\"why b\",\"outcome\":\"committed\",\"targetFiles\":[\"b.ts\"],\"nextCyclePlan\":[\"step b\"]}",
        "<!-- FRACTAL_ENTRY {\"timestampUtc\":\"2026-03-12T00:00:00.000Z\",\"chosenChange\":\"c\",\"rationale\":\"why c\",\"outcome\":\"reverted\",\"targetFiles\":[\"c.ts\"],\"blockingReason\":\"need narrower scope\",\"nextCyclePlan\":[\"step c\"]} -->",
        "- handoff_json: {\"timestampUtc\":\"2026-03-12T00:00:00.000Z\",\"chosenChange\":\"c\",\"rationale\":\"why c\",\"outcome\":\"reverted\",\"targetFiles\":[\"c.ts\"],\"blockingReason\":\"need narrower scope\",\"nextCyclePlan\":[\"step c\"]}"
      ].join("\n"),
      "utf8"
    );

    await expect(readRecentEvolveJournalSummary(2, journalPath)).resolves.toEqual([
      {
        timestampUtc: "2026-03-12T00:00:00.000Z",
        chosenChange: "c",
        rationale: "why c",
        outcome: "reverted",
        targetFiles: ["c.ts"],
        blockingReason: "need narrower scope",
        nextCyclePlan: ["step c"]
      },
      {
        timestampUtc: "2026-03-11T00:00:00.000Z",
        chosenChange: "b",
        rationale: "why b",
        outcome: "committed",
        targetFiles: ["b.ts"],
        nextCyclePlan: ["step b"]
      }
    ]);
  });

  test("fails loudly when a recent FRACTAL_ENTRY payload is invalid", async () => {
    const temp = mkdtempSync(join(tmpdir(), "fractal-journal-"));
    const journalPath = join(temp, "JOURNAL.md");
    writeFileSync(
      journalPath,
      '<!-- FRACTAL_ENTRY {"timestampUtc":"2026-03-12T00:00:00.000Z","chosenChange":"bad","rationale":"oops","outcome":"planned","targetFiles":[],"nextCyclePlan":"not-an-array"} -->',
      "utf8"
    );

    await expect(readRecentEvolveJournalSummary(1, journalPath)).rejects.toThrow(
      `Invalid evolve journal payload at ${journalPath}:1: nextCyclePlan must be an array of strings`
    );
  });
});
