import { readFile } from "node:fs/promises";
import {
  parseMachineReadableBlocks,
  validateJournalMachineReadablePayload,
  type JournalMachineReadableBlock
} from "./journal-validator.ts";

export type RecentEvolveCycleSummary = JournalMachineReadableBlock;

export async function readRecentEvolveJournalSummary(
  limit = 5,
  path = "JOURNAL.md"
): Promise<RecentEvolveCycleSummary[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("limit must be a positive integer");
  }

  let journal: string;
  try {
    journal = await readFile(path, "utf8");
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const summaries: RecentEvolveCycleSummary[] = [];
  let blocks;
  try {
    blocks = parseMachineReadableBlocks(journal);
  } catch {
    return summaries;
  }

  for (let index = blocks.length - 1; index >= 0 && summaries.length < limit; index -= 1) {
    const block = blocks[index];
    if (!block || block.kind !== "entry") {
      continue;
    }

    const validationError = validateJournalMachineReadablePayload(block.payload);
    if (validationError) {
      continue;
    }

    summaries.push(block.payload as RecentEvolveCycleSummary);
  }

  return summaries;
}
