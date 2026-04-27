import {
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport,
  evolveCapabilityRegistry,
  evolveCapabilitySummary,
  exportEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor,
  getVersionedEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityDescriptor,
  type EvolveCapabilitySummary,
  type EvolveCapabilityExport
} from "./evolve/index.ts";
import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  repositoryCapabilitySnapshot,
  rootCapabilityExport,
  type CapabilitySnapshot
} from "./capability-snapshot.ts";

export {
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilityExport,
  evolveCapabilityRegistry,
  evolveCapabilitySummary,
  exportEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor,
  getVersionedEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityDescriptor,
  type EvolveCapabilitySummary,
  type EvolveCapabilityExport,
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  repositoryCapabilitySnapshot,
  rootCapabilityExport,
  type CapabilitySnapshot
};

export type VersionedCapabilityDiscovery = Readonly<{
  version: typeof CAPABILITY_SNAPSHOT_VERSION;
  readOnly: true;
  capability: CapabilitySnapshot;
}>;

export function getVersionedCapabilityDiscovery(): VersionedCapabilityDiscovery {
  return exportVersionedCapabilitySnapshot();
}

export function exportCapabilityDiscovery(): CapabilitySnapshot {
  return capabilitySnapshot;
}
