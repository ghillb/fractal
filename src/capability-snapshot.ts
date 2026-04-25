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

export type CapabilitySnapshot = Readonly<{
  version: typeof EVOLVE_CAPABILITY_DESCRIPTOR_VERSION;
  readOnly: true;
  evolve: EvolveCapabilityExport;
  validation: Readonly<{
    journalBlock: typeof validateMachineReadableBlock;
    summary: typeof readEvolveCapabilitySummary;
    descriptor: typeof getVersionedEvolveCapabilityDescriptor;
    registry: typeof evolveCapabilityRegistry;
  }>;
}>;

export const capabilitySnapshot: CapabilitySnapshot = Object.freeze({
  version: EVOLVE_CAPABILITY_DESCRIPTOR_VERSION,
  readOnly: true,
  evolve: evolveCapabilityExport,
  validation: Object.freeze({
    journalBlock: validateMachineReadableBlock,
    summary: readEvolveCapabilitySummary,
    descriptor: getVersionedEvolveCapabilityDescriptor,
    registry: evolveCapabilityRegistry
  })
});

export const cliCapabilitySnapshot = capabilitySnapshot;
