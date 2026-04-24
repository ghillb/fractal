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
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
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

export type RepositoryCapabilitySnapshot = Readonly<{
  version: typeof EVOLVE_CAPABILITY_DESCRIPTOR_VERSION;
  readOnly: true;
  evolve: EvolveCapabilityExport;
  validation: Readonly<{
    getDescriptor: typeof getVersionedEvolveCapabilityDescriptor;
    readSummary: typeof readEvolveCapabilitySummary;
    registry: typeof evolveCapabilityRegistry;
  }>;
}>;

export const repositoryCapabilitySnapshot: RepositoryCapabilitySnapshot = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  readOnly: true,
  evolve: evolveCapabilityExport,
  validation: Object.freeze({
    getDescriptor: getVersionedEvolveCapabilityDescriptor,
    readSummary: readEvolveCapabilitySummary,
    registry: evolveCapabilityRegistry
  })
});

export const rootCapabilityExport = repositoryCapabilitySnapshot;
