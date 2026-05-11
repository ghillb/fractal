import {
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport,
  evolveCapabilityRegistry,
  evolveCapabilitySummary,
  getVersionedEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityExport
} from "./evolve/index.ts";
import { validateMachineReadableBlock } from "./evolve/journal-validator.ts";

export const CAPABILITY_SNAPSHOT_VERSION = 3 as const;

export type CapabilitySnapshot = Readonly<{
  version: typeof CAPABILITY_SNAPSHOT_VERSION;
  readOnly: true;
  derivedVersion: typeof CAPABILITY_SNAPSHOT_VERSION;
  snapshotVersion: typeof CAPABILITY_SNAPSHOT_VERSION;
  evolve: EvolveCapabilityExport;
  validation: Readonly<{
    journalBlock: typeof validateMachineReadableBlock;
    summary: typeof readEvolveCapabilitySummary;
    descriptor: typeof getVersionedEvolveCapabilityDescriptor;
    registry: typeof evolveCapabilityRegistry;
  }>;
  surface: Readonly<{
    version: typeof CAPABILITY_SNAPSHOT_VERSION;
    stableShape: true;
    derived: true;
    snapshotVersion: typeof CAPABILITY_SNAPSHOT_VERSION;
    publicShapeVersion: typeof CAPABILITY_SNAPSHOT_VERSION;
    shapeVersion: typeof CAPABILITY_SNAPSHOT_VERSION;
  }>;
}>;

export const capabilitySnapshot: CapabilitySnapshot = Object.freeze({
  version: CAPABILITY_SNAPSHOT_VERSION,
  readOnly: true,
  derivedVersion: CAPABILITY_SNAPSHOT_VERSION,
  snapshotVersion: CAPABILITY_SNAPSHOT_VERSION,
  evolve: Object.freeze(evolveCapabilityExport),
  validation: Object.freeze({
    journalBlock: validateMachineReadableBlock,
    summary: readEvolveCapabilitySummary,
    descriptor: getVersionedEvolveCapabilityDescriptor,
    registry: evolveCapabilityRegistry
  }),
  surface: Object.freeze({
    version: CAPABILITY_SNAPSHOT_VERSION,
    stableShape: true,
    derived: true,
    snapshotVersion: CAPABILITY_SNAPSHOT_VERSION,
    publicShapeVersion: CAPABILITY_SNAPSHOT_VERSION,
    shapeVersion: CAPABILITY_SNAPSHOT_VERSION
  })
});

export function exportCapabilitySnapshot(): CapabilitySnapshot {
  return capabilitySnapshot;
}

export function exportVersionedCapabilitySnapshot(): Readonly<{
  version: typeof CAPABILITY_SNAPSHOT_VERSION;
  readOnly: true;
  capability: CapabilitySnapshot;
}> {
  return Object.freeze({
    version: CAPABILITY_SNAPSHOT_VERSION,
    readOnly: true,
    capability: capabilitySnapshot
  });
}

export function exportCapabilityDiscovery(): CapabilitySnapshot {
  return capabilitySnapshot;
}

export function getVersionedCapabilityDiscovery(): Readonly<{
  version: typeof CAPABILITY_SNAPSHOT_VERSION;
  readOnly: true;
  capability: CapabilitySnapshot;
}> {
  return exportVersionedCapabilitySnapshot();
}

export const cliCapabilitySnapshot = capabilitySnapshot;
export const rootCapabilityExport = capabilitySnapshot;
export const repositoryCapabilitySnapshot = capabilitySnapshot;
