import {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilitySummary,
  exportEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor,
  getVersionedEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityDescriptor,
  type EvolveCapabilitySummary
} from "./capability-summary";

export {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  evolveCapabilitySummary,
  exportEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor,
  getVersionedEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityDescriptor,
  type EvolveCapabilitySummary
};

export {
  getEvolveCapabilityDescriptor as evolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor as getEvolveCapabilityDescriptorAdapter,
  getEvolveCapabilityDescriptor as getEvolveCapabilityManifest,
  getEvolveCapabilityDescriptor as getEvolveCapabilityManifestVersioned,
  getVersionedEvolveCapabilityDescriptor as evolveCapabilityDescriptorVersioned
} from "./capability-summary";

export type { EvolveCapabilityDescriptor as EvolveCapabilityManifest } from "./capability-summary";

export const evolveCapabilityExport = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  readOnly: true,
  getDescriptor: getVersionedEvolveCapabilityDescriptor,
  summary: evolveCapabilitySummary,
  export: EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT
});
