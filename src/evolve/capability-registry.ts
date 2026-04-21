import { readEvolveCapabilitySummary, type EvolveCapabilitySummary } from "./capability-summary.ts";
import { readRepositoryCapabilityManifest, type RepositoryCapabilityManifest } from "./journal.ts";

export const EVOLVE_CAPABILITY_REGISTRY_VERSION = 1 as const;

export type EvolveCapabilityRegistry = Readonly<{
  version: typeof EVOLVE_CAPABILITY_REGISTRY_VERSION;
  readOnly: true;
  source: "persisted-evolve-journal";
  machineReadable: Readonly<{
    summary: EvolveCapabilitySummary;
    journal: RepositoryCapabilityManifest;
    capabilityNames: readonly string[];
  }>;
}>;

function freezeCapabilityRegistry(registry: EvolveCapabilityRegistry): EvolveCapabilityRegistry {
  return Object.freeze({
    ...registry,
    machineReadable: Object.freeze({
      ...registry.machineReadable,
      capabilityNames: Object.freeze([...registry.machineReadable.capabilityNames]),
      summary: Object.freeze({
        ...registry.machineReadable.summary,
        latestTargetFiles: Object.freeze([...registry.machineReadable.summary.latestTargetFiles]),
        capabilityNames: Object.freeze([...registry.machineReadable.summary.capabilityNames])
      }),
      journal: Object.freeze({
        ...registry.machineReadable.journal,
        machineReadable: Object.freeze({
          ...registry.machineReadable.journal.machineReadable,
          latestTargetFiles: Object.freeze([...registry.machineReadable.journal.machineReadable.latestTargetFiles]),
          capabilityNames: Object.freeze([...registry.machineReadable.journal.machineReadable.capabilityNames])
        })
      })
    })
  });
}

export async function readEvolveCapabilityRegistry(
  summaryLimit?: number,
  path?: string
): Promise<EvolveCapabilityRegistry> {
  const [summary, journal] = await Promise.all([
    readEvolveCapabilitySummary(summaryLimit, path),
    readRepositoryCapabilityManifest(path)
  ]);

  return freezeCapabilityRegistry({
    version: EVOLVE_CAPABILITY_REGISTRY_VERSION,
    readOnly: true,
    source: "persisted-evolve-journal",
    machineReadable: {
      summary,
      journal,
      capabilityNames: [...new Set([
        ...summary.capabilityNames,
        ...journal.machineReadable.capabilityNames,
        "evolve-capability-registry"
      ])].sort()
    }
  });
}

export const evolveCapabilityRegistry = {
  version: EVOLVE_CAPABILITY_REGISTRY_VERSION,
  read: readEvolveCapabilityRegistry
} as const;
