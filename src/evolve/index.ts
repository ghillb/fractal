import { getEvolveCapabilityDescriptor } from "./capability-summary.ts";

export {
  EVOLVE_CAPABILITY_DESCRIPTOR,
  EVOLVE_CAPABILITY_DESCRIPTOR_EXPORT,
  EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  exportEvolveCapabilityDescriptor,
  getEvolveCapabilityDescriptor,
  readEvolveCapabilitySummary,
  type EvolveCapabilityDescriptor,
  type EvolveCapabilitySummary
} from "./capability-summary.ts";

export { getEvolveCapabilityDescriptor as evolveCapabilityDescriptor } from "./capability-summary.ts";
export { getEvolveCapabilityDescriptor as getEvolveCapabilityDescriptorAdapter } from "./capability-summary.ts";

export function getEvolveCapabilityManifest() {
  return getEvolveCapabilityDescriptor();
}
