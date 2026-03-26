import { readFile } from "node:fs/promises";
import { exec } from "../core/shell.ts";
import { hackernewsTrendingTool } from "../tools/hackernews.ts";
import {
  countTrailingPlannedEntries,
  extractLatestPlanFromJournalWithDiagnostics,
  type JournalReadDiagnostics
} from "./journal.ts";
import { readRecentEvolveJournalSummary } from "./read-evolve-journal-summary.ts";
import type {
  ObserveData,
  ObserveHnSignalEntry,
  ObserveJournalIntegrity,
  ObserveRecentCycleSummaryEntry
} from "./types.ts";

const PLANNER_RECENT_CYCLE_SUMMARY_LIMIT = 3;
const PLANNER_HN_SIGNAL_LIMIT = 3;

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

function normalizeRecentCycleSummaryEntry(
  entry: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>[number]
): ObserveRecentCycleSummaryEntry {
  return {
    timestampUtc: entry.timestampUtc,
    chosenChange: entry.chosenChange,
    rationale: entry.rationale,
    outcome: entry.outcome,
    targetFiles: [...entry.targetFiles],
    nextCyclePlan: [...entry.nextCyclePlan],
    ...(entry.blockingReason ? { blockingReason: entry.blockingReason } : {})
  };
}

export function buildPlannerJournalIntegrity(
  diagnostics: JournalReadDiagnostics
): ObserveJournalIntegrity {
  return {
    rejectedHistoricalEntryCount: diagnostics.rejectedCount,
    ...(diagnostics.rejectionSummary.length > 0
      ? { rejectionSummary: [...diagnostics.rejectionSummary] }
      : {})
  };
}

function normalizeHnSignalEntry(entry: Record<string, unknown>): ObserveHnSignalEntry {
  return {
    title: typeof entry.title === "string" ? entry.title : "",
    url: typeof entry.url === "string" ? entry.url : "",
    hnUrl: typeof entry.hn_url === "string" ? entry.hn_url : "",
    points: typeof entry.points === "number" ? entry.points : 0,
    comments: typeof entry.comments === "number" ? entry.comments : 0,
    author: typeof entry.author === "string" ? entry.author : "",
    createdAt: typeof entry.created_at === "string" ? entry.created_at : ""
  };
}

export function buildPlannerRecentCycleSummary(
  entries: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>
): ObserveRecentCycleSummaryEntry[] {
  return entries
    .slice(0, PLANNER_RECENT_CYCLE_SUMMARY_LIMIT)
    .map((entry) => normalizeRecentCycleSummaryEntry(entry));
}

export function buildPlannerHnSignal(entries: Array<Record<string, unknown>>): ObserveHnSignalEntry[] {
  return entries.slice(0, PLANNER_HN_SIGNAL_LIMIT).map((entry) => normalizeHnSignalEntry(entry));
}

export function summarizeRecentHotFilesFromHistory(historyOutput: string): string[] {
  const counts = new Map<string, number>();

  for (const rawLine of historyOutput.split("\n")) {
    const file = rawLine.trim();
    if (!file || file === "JOURNAL.md") {
      continue;
    }

    counts.set(file, (counts.get(file) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= 3)
    .map(([file]) => file)
    .sort();
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
  const recentFileHistory = exec("git log --name-only --pretty=format: -n 12 2>/dev/null || true").stdout;
  const recentHotFiles = summarizeRecentHotFilesFromHistory(recentFileHistory);

  let journalTail = "";
  let consecutivePlanCount = 0;
  let latestPlan: ObserveData["latestPlan"];
  let journalIntegrity = buildPlannerJournalIntegrity({ rejectedCount: 0, rejectionSummary: [] });
  try {
    const journal = await readFile("JOURNAL.md", "utf8");
    journalTail = tail(journal, 12000);
    consecutivePlanCount = countTrailingPlannedEntries(journal);
    const latestPlanWithDiagnostics = extractLatestPlanFromJournalWithDiagnostics(journal);
    latestPlan = latestPlanWithDiagnostics.handoff;
    journalIntegrity = buildPlannerJournalIntegrity(latestPlanWithDiagnostics.diagnostics);
  } catch {
    journalTail = "";
    consecutivePlanCount = 0;
    latestPlan = undefined;
    journalIntegrity = buildPlannerJournalIntegrity({ rejectedCount: 0, rejectionSummary: [] });
  }

  let recentCycleSummary: ObserveData["recentCycleSummary"] = [];
  try {
    recentCycleSummary = buildPlannerRecentCycleSummary(await readRecentEvolveJournalSummary());
  } catch {
    recentCycleSummary = [];
  }

  let hnSignal: ObserveData["hnSignal"] = [];
  try {
    const response = await hackernewsTrendingTool({ hours: 24, minPoints: 120, n: 5 });
    const results = response.results;
    if (Array.isArray(results)) {
      hnSignal = buildPlannerHnSignal(results as Array<Record<string, unknown>>);
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
    journalIntegrity,
    recentCycleSummary,
    recentHotFiles,
    hnSignal
  };
}
