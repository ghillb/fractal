import { readRecentEvolveJournalSummary } from "./read-evolve-journal-summary.ts";

export const EVOLVE_CAPABILITY_DESCRIPTOR_VERSION = 1 as const;

export type EvolveCapabilityDescriptor = Readonly<{
  version: typeof EVOLVE_CAPABILITY_DESCRIPTOR_VERSION;
  source: "persisted-evolve-journal";
  readOnly: true;
  machineReadable: Readonly<{
    entryLimit: number;
    summaryFormat: "machine-readable";
  }>;
}>;

export const EVOLVE_CAPABILITY_DESCRIPTOR: EvolveCapabilityDescriptor = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  source: "persisted-evolve-journal",
  readOnly: true,
  machineReadable: Object.freeze({
    entryLimit: 5,
    summaryFormat: "machine-readable"
  })
});

export function getEvolveCapabilityDescriptor(): EvolveCapabilityDescriptor {
  return JSON.parse(JSON.stringify(EVOLVE_CAPABILITY_DESCRIPTOR)) as EvolveCapabilityDescriptor;
}

export function exportEvolveCapabilityDescriptor(): string {
  return JSON.stringify(EVOLVE_CAPABILITY_DESCRIPTOR);
}

export const EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT = exportEvolveCapabilityDescriptor();

export type EvolveCapabilitySummary = {
  descriptor: EvolveCapabilityDescriptor;
  entryCount: number;
  latestTimestampUtc?: string;
  latestOutcome?: "committed" | "planned" | "reverted";
  latestTargetFiles: string[];
  capabilityNames: string[];
};

export async function readEvolveCapabilitySummary(
  limit = EVOLVE_CAPABILITY_DESCRIPTOR.machineReadable.entryLimit,
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
