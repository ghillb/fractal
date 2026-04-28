import {
  CAPABILITY_SNAPSHOT_VERSION,
  capabilitySnapshot,
  exportCapabilitySnapshot,
  exportVersionedCapabilitySnapshot,
  rootCapabilityExport,
  type CapabilitySnapshot
} from "./capability-snapshot.ts";
import {
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata,
  type DiagnosticsMetadata
} from "./diagnostics.ts";
import {
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata,
  type EventIntrospectionMetadata
} from "./event-introspection.ts";
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
  DIAGNOSTICS_VERSION,
  exportDiagnosticsMetadata,
  getDiagnosticsMetadata,
  getVersionedDiagnosticsMetadata,
  type DiagnosticsMetadata,
  EVENT_INTROSPECTION_VERSION,
  exportEventIntrospectionMetadata,
  getEventIntrospectionMetadata,
  getVersionedEventIntrospectionMetadata,
  type EventIntrospectionMetadata,
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
