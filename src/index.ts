import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  rootCapabilityExport,
  type CapabilitySnapshot
} from "./capability-snapshot.ts";
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

export {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  rootCapabilityExport,
  type CapabilitySnapshot,
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
