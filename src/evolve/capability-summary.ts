import { readRecentEvolveJournalSummary } from "./read-evolve-journal-summary.ts";

export type EvolveCapabilityDescriptor = Readonly<{
  version: 1;
  source: "persisted-evolve-journal";
}>;

export const EVOLVE_CAPABILITY_DESCRIPTOR: EvolveCapabilityDescriptor = Object.freeze({
  version: 1,
  source: "persisted-evolve-journal"
});

export type EvolveCapabilitySummary = {
  descriptor: EvolveCapabilityDescriptor;
  entryCount: number;
  latestTimestampUtc?: string;
  latestOutcome?: "committed" | "planned" | "reverted";
  latestTargetFiles: string[];
  capabilityNames: string[];
};

export async function readEvolveCapabilitySummary(
  limit = 5,
  path = "JOURNAL.md"
): Promise<EvolveCapabilitySummary> {
  const entries = await readRecentEvolveJournalSummary(limit, path);
  const latest = entries[0];
  const capabilityNames = new Set<string>();

  for (const entry of entries) {
    capabilityNames.add("persisted-evolve-journal");
    if (entry.outcome === "planned" || entry.outcome === "reverted" || entry.outcome === "committed") {
      capabilityNames.add(`outcome:${entry.outcome}`);
    }
    for (const targetFile of entry.targetFiles) {
      capabilityNames.add(`target:${targetFile}`);
    }
  }

  return {
    descriptor: EVOLVE_CAPABILITY_DESCRIPTOR,
    entryCount: entries.length,
    latestTimestampUtc: latest?.timestampUtc,
    latestOutcome: latest?.outcome,
    latestTargetFiles: latest?.targetFiles ?? [],
    capabilityNames: [...capabilityNames].sort()
  };
}
