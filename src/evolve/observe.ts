import { readFile } from "node:fs/promises";
import { exec } from "../core/shell.ts";
import { hackernewsTrendingTool, type HackernewsTrendingResult } from "../tools/hackernews.ts";
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
  ObserveLatestCycleCompletionSummary,
  ObserveLatestCycleHandoff,
  ObserveRecentCycleSummaryEntry,
  ObserveRepositoryActivitySignal
} from "./types.ts";

const PLANNER_RECENT_CYCLE_SUMMARY_LIMIT = 3;
const PLANNER_HN_SIGNAL_LIMIT = 3;
const PLANNER_LATEST_CYCLE_TARGET_FILES_LIMIT = 5;
const PLANNER_ACTIVITY_LOOKBACK_LIMIT = 8;
const PLANNER_ACTIVITY_ACTIVE_THRESHOLD = 2;
const PLANNER_ACTIVITY_FILES_CAP = 5;
const PLANNER_ACTIVITY_FRESHNESS_MAX = 100;

function buildRepositoryActivitySignal(entries: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>): ObserveRepositoryActivitySignal {
  const uniqueFiles = new Set<string>();
  let recentChangeStreak = 0;

  for (const entry of entries.slice(0, PLANNER_ACTIVITY_LOOKBACK_LIMIT)) {
    for (const file of entry.targetFiles.slice(0, PLANNER_ACTIVITY_FILES_CAP)) {
      uniqueFiles.add(file);
    }
    if (entry.outcome === "planned" || entry.outcome === "committed") {
      recentChangeStreak += 1;
    } else {
      break;
    }
  }

  const distinctFilesTouched = Math.min(uniqueFiles.size, PLANNER_ACTIVITY_FILES_CAP);
  const freshnessScore = Math.min(PLANNER_ACTIVITY_FRESHNESS_MAX, recentChangeStreak * 20 + distinctFilesTouched * 12);
  const freshnessLabel = freshnessScore >= 60 ? "active" : freshnessScore >= 20 ? "warming" : "idle";
  const activityHint: ObserveRepositoryActivitySignal["activityHint"] =
    freshnessLabel === "active" ? "active" : freshnessLabel === "warming" ? "warming" : "idle";

  return {
    active: recentChangeStreak >= PLANNER_ACTIVITY_ACTIVE_THRESHOLD,
    distinctFilesTouched,
    recentChangeStreak: Math.min(recentChangeStreak, PLANNER_ACTIVITY_LOOKBACK_LIMIT),
    freshnessScore,
    freshnessLabel,
    activityHint,
    freshEnoughForPlanning: freshnessLabel !== "idle"
  };
}

function isFinishedOutcome(outcome: "committed" | "planned" | "reverted"): boolean {
  return outcome === "committed" || outcome === "reverted";
}

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

function buildLatestCycleCompletionSummary(
  entry: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>[number] | undefined
): ObserveLatestCycleCompletionSummary | undefined {
  if (!entry) {
    return undefined;
  }

  const handoff = normalizeLatestCycleHandoff(entry);
  if (!handoff) {
    return undefined;
  }

  return {
    ...handoff,
    summary: `${handoff.finished ? "finished" : "unfinished"}; outcome=${handoff.outcome}; targetFiles=${handoff.targetFiles.join(", ") || "none"}`
  };
}

function normalizeLatestCycleHandoff(
  entry: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>[number] | undefined
): ObserveLatestCycleHandoff | undefined {
  if (!entry) {
    return undefined;
  }

  const finished = isFinishedOutcome(entry.outcome);
  return {
    outcome: entry.outcome,
    targetFiles: entry.targetFiles.slice(0, PLANNER_LATEST_CYCLE_TARGET_FILES_LIMIT),
    finished,
    unfinished: !finished
  };
}

function buildLatestPlannedCycleUnfinished(
  latestPlan: ObserveData["latestPlan"],
  latestCycleFinished: ObserveData["latestCycleFinished"],
  latestCycleUnfinished: ObserveData["latestCycleUnfinished"]
): boolean | undefined {
  if (!latestPlan || latestPlan.outcome !== "planned") {
    return undefined;
  }

  const unfinishedFromLatestCycle = latestCycleUnfinished ?? (latestCycleFinished === undefined ? undefined : !latestCycleFinished);
  const plannedCycleIsUnfinished = unfinishedFromLatestCycle ?? latestPlan.nextCyclePlan.length > 0;
  return plannedCycleIsUnfinished;
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

export function buildPlannerLatestCycleHandoff(
  entries: Awaited<ReturnType<typeof readRecentEvolveJournalSummary>>
): ObserveLatestCycleHandoff | undefined {
  return normalizeLatestCycleHandoff(entries[0]);
}

export function buildPlannerHnSignal(entries: Pick<HackernewsTrendingResult, "results">): ObserveHnSignalEntry[] {
  return entries.results.slice(0, PLANNER_HN_SIGNAL_LIMIT).map((entry) => normalizeHnSignalEntry(entry));
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

  let repositoryActivity: ObserveRepositoryActivitySignal = { active: false, distinctFilesTouched: 0, recentChangeStreak: 0, freshnessScore: 0, freshnessLabel: "idle", activityHint: "idle", freshEnoughForPlanning: false };
  let recentCycleSummary: ObserveData["recentCycleSummary"] = [];
  let latestCycleOutcome: ObserveData["latestCycleOutcome"];
  let latestCycleTargetFiles: ObserveData["latestCycleTargetFiles"] = [];
  let latestCycleFinished: ObserveData["latestCycleFinished"];
  let latestCycleUnfinished: ObserveData["latestCycleUnfinished"];
  let latestCycleCompletionSummary: ObserveData["latestCycleCompletionSummary"];
  try {
    const recentEntries = await readRecentEvolveJournalSummary();
    repositoryActivity = buildRepositoryActivitySignal(recentEntries);
    recentCycleSummary = buildPlannerRecentCycleSummary(recentEntries);
    const latestCycle = buildPlannerLatestCycleHandoff(recentEntries);
    latestCycleOutcome = latestCycle?.outcome;
    latestCycleTargetFiles = latestCycle?.targetFiles ?? [];
    latestCycleFinished = latestCycle?.finished;
    latestCycleUnfinished = latestCycle?.unfinished;
    latestCycleCompletionSummary = buildLatestCycleCompletionSummary(recentEntries[0])?.summary;
  } catch {
    repositoryActivity = { active: false, distinctFilesTouched: 0, recentChangeStreak: 0, freshnessScore: 0, freshnessLabel: "idle", activityHint: "idle", freshEnoughForPlanning: false };
    recentCycleSummary = [];
    latestCycleOutcome = undefined;
    latestCycleTargetFiles = [];
    latestCycleFinished = undefined;
    latestCycleUnfinished = undefined;
    latestCycleCompletionSummary = undefined;
  }

  const latestPlannedCycleUnfinished = buildLatestPlannedCycleUnfinished(latestPlan, latestCycleFinished, latestCycleUnfinished);

  const hnTrending = await hackernewsTrendingTool({ hours: 24, minPoints: 50, n: 10 });
  const hnSignal = buildPlannerHnSignal(hnTrending);

  return {
    issues,
    commits,
    journalTail,
    consecutivePlanCount,
    latestPlan,
    latestCycleOutcome,
    latestCycleTargetFiles,
    latestCycleFinished,
    latestCycleUnfinished,
    latestCycleCompletionSummary,
    latestPlannedCycleUnfinished,
    journalIntegrity,
    repositoryActivity,
    recentCycleSummary,
    recentHotFiles,
    hnSignal
  };
}
