import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendJournal } from "../src/evolve/journal.ts";

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
        filesTouched: ["a.ts"],
        lintOutcome: "pass",
        testOutcome: "pass",
        followUps: ["next"]
      });

      const content = await readFile(join(temp, "JOURNAL.md"), "utf8");
      expect(content.includes("timestamp_utc: 2026-03-07T00:00:00.000Z")).toBe(true);
      expect(content.includes("files_touched: a.ts")).toBe(true);
    } finally {
      process.chdir(cwd);
    }
  });
});
