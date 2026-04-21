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
} from "./capability-summary.ts";
import { evolveCapabilityRegistry } from "./capability-registry.ts";

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
  type EvolveCapabilitySummary,
  evolveCapabilityRegistry
};

export {
  getEvolveCapabilityDescriptor as evolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor as getEvolveCapabilityDescriptorAdapter,
  getEvolveCapabilityDescriptor as getEvolveCapabilityManifest,
  getEvolveCapabilityDescriptor as getEvolveCapabilityManifestVersioned,
  getVersionedEvolveCapabilityDescriptor as evolveCapabilityDescriptorVersioned
} from "./capability-summary.ts";

export type { EvolveCapabilityDescriptor as EvolveCapabilityManifest } from "./capability-summary.ts";

export const evolveCapabilityExport = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  readOnly: true,
  getDescriptor: getVersionedEvolveCapabilityDescriptor,
  summary: evolveCapabilitySummary,
  export: EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  registry: evolveCapabilityRegistry
});
