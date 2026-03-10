import { readFile } from "node:fs/promises";
import { exec } from "../core/shell.ts";
import { hackernewsTrendingTool } from "../tools/hackernews.ts";
import { countTrailingPlannedEntries, extractLatestPlanFromJournal } from "./journal.ts";
import type { ObserveData } from "./types.ts";

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function tail(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return text.slice(text.length - maxChars);
}

export async function gatherObservations(): Promise<ObserveData> {
  const issuesResult = exec("gh issue list --state open --limit 20 --json number,title,updatedAt 2>/dev/null || echo '[]'");
  const issues = parseJson<Array<{ number: number; title: string; updatedAt: string }>>(
    issuesResult.stdout,
    []
  );

  const commitsResult = exec(
    "git log --pretty=format:'%H|%ad|%s' --date=iso -n 12 2>/dev/null || true"
  );
  const commits = commitsResult.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...subjectParts] = line.split("|");
      return {
        hash: hash ?? "",
        date: date ?? "",
        subject: subjectParts.join("|")
      };
    });

  let journalTail = "";
  let consecutivePlanCount = 0;
  let latestPlan: ObserveData["latestPlan"];
  try {
    const journal = await readFile("JOURNAL.md", "utf8");
    journalTail = tail(journal, 12000);
    consecutivePlanCount = countTrailingPlannedEntries(journal);
    latestPlan = extractLatestPlanFromJournal(journal);
  } catch {
    journalTail = "";
    consecutivePlanCount = 0;
    latestPlan = undefined;
  }

  let hnSignal: Array<Record<string, unknown>> = [];
  try {
    const response = await hackernewsTrendingTool({ hours: 24, minPoints: 120, n: 5 });
    const results = response.results;
    if (Array.isArray(results)) {
      hnSignal = results as Array<Record<string, unknown>>;
    }
  } catch {
    hnSignal = [];
  }

  return {
    issues,
    commits,
    journalTail,
    consecutivePlanCount,
    latestPlan,
    hnSignal
  };
}
