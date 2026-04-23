import { EVOLVE_CAPABILITY_DESCRIPTOR_VERSION, evolveCapabilityExport } from "./evolve/index.ts";

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

export const rootCapabilityExport = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  readOnly: true,
  evolve: evolveCapabilityExport
} as const);
