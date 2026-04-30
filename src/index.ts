import {
  LIFECYCLE_VERSION,
  exportLifecycleInspection,
  getLifecycleInspection,
  getVersionedLifecycleInspection,
  type LifecycleInspection,
  type VersionedLifecycleInspection
} from "./lifecycle.ts";
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
  LIFECYCLE_VERSION,
  exportLifecycleInspection,
  getLifecycleInspection,
  getVersionedLifecycleInspection,
  type LifecycleInspection,
  type VersionedLifecycleInspection,
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

export type VersionedDiagnosticsDiscovery = Readonly<{
  version: typeof DIAGNOSTICS_VERSION;
  readOnly: true;
  metadata: DiagnosticsMetadata;
}>;

export function getVersionedCapabilityDiscovery(): VersionedCapabilityDiscovery {
  return exportVersionedCapabilitySnapshot();
}

export function exportCapabilityDiscovery(): CapabilitySnapshot {
  return capabilitySnapshot;
}

export function getVersionedDiagnosticsDiscovery(): VersionedDiagnosticsDiscovery {
  return getVersionedDiagnosticsMetadata();
}

export type VersionedLifecycleDiscovery = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  readOnly: true;
  lifecycle: LifecycleInspection;
}>;

export function getVersionedLifecycleDiscovery(): VersionedLifecycleDiscovery {
  return Object.freeze({
    version: LIFECYCLE_VERSION,
    readOnly: true,
    lifecycle: getLifecycleInspection()
  });
}

export function exportLifecycleDiscovery(): LifecycleInspection {
  return exportLifecycleInspection();
}
