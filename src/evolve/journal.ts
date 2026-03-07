import { appendFile, access } from "node:fs/promises";
import { constants } from "node:fs";

export type JournalEntry = {
  timestampUtc: string;
  mode: "dry-run" | "real";
  goal: string;
  chosenChange: string;
  rationale: string;
  filesTouched: string[];
  lintOutcome: "pass" | "fail" | "skipped";
  testOutcome: "pass" | "fail" | "skipped";
  followUps: string[];
  failureNote?: string;
};

const HEADER = `# JOURNAL\n\nAutonomous evolve cycle log.\n\n`;

export async function ensureJournal(): Promise<void> {
  try {
    await access("JOURNAL.md", constants.F_OK);
  } catch {
    await appendFile("JOURNAL.md", HEADER, "utf8");
  }
}

export async function appendJournal(entry: JournalEntry): Promise<void> {
  await ensureJournal();
  const block = [
    `## Entry ${entry.timestampUtc}`,
    `- timestamp_utc: ${entry.timestampUtc}`,
    `- mode: ${entry.mode}`,
    `- goal: ${entry.goal}`,
    `- chosen_change: ${entry.chosenChange}`,
    `- rationale: ${entry.rationale}`,
    `- files_touched: ${entry.filesTouched.join(", ") || "none"}`,
    `- lint: ${entry.lintOutcome}`,
    `- tests: ${entry.testOutcome}`,
    `- follow_ups: ${(entry.followUps.slice(0, 3) || []).join(" | ") || "none"}`,
    entry.failureNote ? `- failure_note: ${entry.failureNote}` : "",
    ""
  ]
    .filter(Boolean)
    .join("\n");

  await appendFile("JOURNAL.md", `${block}\n`, "utf8");
}
