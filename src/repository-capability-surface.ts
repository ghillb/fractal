import { capabilitySnapshot } from "./capability-snapshot.ts";

export const REPOSITORY_CAPABILITY_SURFACE_VERSION = 13 as const;

export type RepositoryCapabilitySurface = Readonly<{
  version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
  readOnly: true;
  derivedVersion: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
  exportVisibility: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    visible: true;
    derived: true;
  }>;
  immutableDerivedSnapshot: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "frozen-shallow-readonly";
    derived: true;
  }>;
  schemaStability: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    stable: true;
    derived: true;
  }>;
  publicShape: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    shape: "versioned-readonly-derived-surface";
    derived: true;
  }>;
  publicShapeSignature: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "versioned-readonly-derived-surface";
    derived: true;
  }>;
  sourceFingerprint: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "src/repository-capability-surface.ts@11";
    derived: true;
  }>;
  schemaVersionDerivedInspectionSurface: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-derived-inspection-surface/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  capabilitySurfaceDescriptor: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface-descriptor@10";
    derived: true;
  }>;
  versionedSchemaDigest: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema@4#stable:v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  introspectionTier: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "telemetry-adjacent";
    derived: true;
  }>;
  schemaVersionTag: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface/v4";
    derived: true;
  }>;
  schemaSignature: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface@4";
    derived: true;
  }>;
  schemaVersion: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: 4;
    derived: true;
  }>;
  schemaVersionLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface-schema@4";
    derived: true;
  }>;
  schemaVersionDigest: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface-schema@4#stable";
    derived: true;
  }>;
  versionedReadOnly: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: true;
    derived: true;
  }>;
  exportContractVersion: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    derived: true;
  }>;
  versionedSchemaContract: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionedSurface: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionContract: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema-contract/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionChecksum: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface-schema@4#stable:v8";
    derived: true;
  }>;
  schemaVersionFingerprint: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema@4#stable:fingerprint:v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionAlias: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema-alias/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  versionedSchemaVersion: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionStability: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "schema-version-stable";
    derived: true;
  }>;
  versionedSchemaStability: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionLock: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "schema-version-lock";
    derived: true;
  }>;
  schemaVersionContractSignature: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema-contract/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  versionedSchemaAnchor: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionSummary: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionManifest: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  versionedSchemaFingerprint: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  derivedSchemaVersionStamp: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-derived-schema@${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionInvariant: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-invariant/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  derivedSchemaVersionTag: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-derived-tag/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionOrdinal: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema-ordinal/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  derivedSchemaVersionFingerprint: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-derived-fingerprint/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionLineage: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    schemaVersion: 4;
    value: `repository-capability-surface-schema-lineage/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    readOnly: true;
    derived: true;
    stableShape: true;
  }>;
  schemaVersionRelease: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-release/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionChecksumLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-checksum-label/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionEdition: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-edition/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionBlueprint: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-blueprint/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionRegistry: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-registry/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionManifestLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-manifest-label/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionStabilityLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-stability-label/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionVersionLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-version-label/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionLockLabel: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-lock-label/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionReadOnlyDerivedField: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-read-only-derived-field/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionDerivedCapabilitySignal: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-derived-capability-signal/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionSurfaceVersion: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-surface-version/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  shallowImmutabilityWitness: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-shallow-immutability-witness/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionSchemaStabilityWitness: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-schema-stability-witness/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
  schemaVersionBoundaryExport: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: `repository-capability-surface-boundary-export/v${typeof REPOSITORY_CAPABILITY_SURFACE_VERSION}`;
    derived: true;
  }>;
}>;

const repositoryCapabilitySurface: RepositoryCapabilitySurface = Object.freeze({
  version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
  readOnly: true,
  derivedVersion: REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportVisibility: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, visible: true, derived: true }),
  immutableDerivedSnapshot: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "frozen-shallow-readonly", derived: true }),
  schemaStability: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, stable: true, derived: true }),
  publicShape: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, shape: "versioned-readonly-derived-surface", derived: true }),
  publicShapeSignature: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "versioned-readonly-derived-surface", derived: true }),
  sourceFingerprint: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "src/repository-capability-surface.ts@11", derived: true }),
  schemaVersionDerivedInspectionSurface: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-derived-inspection-surface/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  capabilitySurfaceDescriptor: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface-descriptor@10", derived: true }),
  versionedSchemaDigest: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema@4#stable:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  introspectionTier: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "telemetry-adjacent", derived: true }),
  schemaVersionTag: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface/v4", derived: true }),
  schemaSignature: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface@4", derived: true }),
  schemaVersion: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: 4, derived: true }),
  schemaVersionLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface-schema@4", derived: true }),
  schemaVersionDigest: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface-schema@4#stable", derived: true }),
  versionedReadOnly: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: true, derived: true }),
  exportContractVersion: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: REPOSITORY_CAPABILITY_SURFACE_VERSION, derived: true }),
  versionedSchemaContract: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionedSurface: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionContract: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema-contract/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionChecksum: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "repository-capability-surface-schema@4#stable:v8", derived: true }),
  schemaVersionFingerprint: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema@4#stable:fingerprint:v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionAlias: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema-alias/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  versionedSchemaVersion: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  schemaVersionStability: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "schema-version-stable", derived: true }),
  versionedSchemaStability: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  schemaVersionLock: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: "schema-version-lock", derived: true }),
  schemaVersionContractSignature: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema-contract/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  versionedSchemaAnchor: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  schemaVersionSummary: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  schemaVersionManifest: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  versionedSchemaFingerprint: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, readOnly: true, derived: true, stableShape: true }),
  derivedSchemaVersionStamp: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-derived-schema@${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionInvariant: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-invariant/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  derivedSchemaVersionTag: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-derived-tag/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionOrdinal: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema-ordinal/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  derivedSchemaVersionFingerprint: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-derived-fingerprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionLineage: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, schemaVersion: 4, value: `repository-capability-surface-schema-lineage/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, readOnly: true, derived: true, stableShape: true }),
  schemaVersionRelease: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-release/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionChecksumLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-checksum-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionEdition: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-edition/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionBlueprint: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-blueprint/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionRegistry: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-registry/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionManifestLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-manifest-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionStabilityLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-stability-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionVersionLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-version-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionLockLabel: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-lock-label/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionReadOnlyDerivedField: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-read-only-derived-field/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionDerivedCapabilitySignal: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-derived-capability-signal/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionSurfaceVersion: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-surface-version/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  shallowImmutabilityWitness: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-shallow-immutability-witness/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionSchemaStabilityWitness: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-schema-stability-witness/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true }),
  schemaVersionBoundaryExport: Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, value: `repository-capability-surface-boundary-export/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`, derived: true })
});

export type VersionedRepositoryCapabilitySurface = Readonly<{ version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION; readOnly: true; surface: RepositoryCapabilitySurface }>;
export const capabilitySurfaceDescriptor = repositoryCapabilitySurface.capabilitySurfaceDescriptor;
export const versionedSchemaAnchor = repositoryCapabilitySurface.versionedSchemaAnchor;
export const versionedSchemaStability = repositoryCapabilitySurface.versionedSchemaStability;
export const schemaVersionSummary = repositoryCapabilitySurface.schemaVersionSummary;
export const schemaVersionManifest = repositoryCapabilitySurface.schemaVersionManifest;
export const versionedSchemaFingerprint = repositoryCapabilitySurface.versionedSchemaFingerprint;
export const schemaVersionContractSignature = repositoryCapabilitySurface.schemaVersionContractSignature;
export const schemaVersionInvariant = repositoryCapabilitySurface.schemaVersionInvariant;
export const derivedSchemaVersionTag = repositoryCapabilitySurface.derivedSchemaVersionTag;
export const schemaVersionOrdinal = repositoryCapabilitySurface.schemaVersionOrdinal;
export const derivedSchemaVersionFingerprint = repositoryCapabilitySurface.derivedSchemaVersionFingerprint;
export const schemaVersionLineage = repositoryCapabilitySurface.schemaVersionLineage;
export const schemaVersionRelease = repositoryCapabilitySurface.schemaVersionRelease;
export const schemaVersionChecksumLabel = repositoryCapabilitySurface.schemaVersionChecksumLabel;
export const schemaVersionDerivedCapabilitySignal = repositoryCapabilitySurface.schemaVersionDerivedCapabilitySignal;
export function exportRepositoryCapabilitySurface(): RepositoryCapabilitySurface { return repositoryCapabilitySurface; }
export function getRepositoryCapabilitySurface(): RepositoryCapabilitySurface { return repositoryCapabilitySurface; }
export function getVersionedRepositoryCapabilitySurface(): VersionedRepositoryCapabilitySurface { return Object.freeze({ version: REPOSITORY_CAPABILITY_SURFACE_VERSION, readOnly: true, surface: repositoryCapabilitySurface }); }

export const schemaVersionEdition = repositoryCapabilitySurface.schemaVersionEdition;
export const schemaVersionBlueprint = repositoryCapabilitySurface.schemaVersionBlueprint;
export const schemaVersionRegistry = repositoryCapabilitySurface.schemaVersionRegistry;
export const schemaVersionManifestLabel = repositoryCapabilitySurface.schemaVersionManifestLabel;
export const schemaVersionStabilityLabel = repositoryCapabilitySurface.schemaVersionStabilityLabel;
export const schemaVersionVersionLabel = repositoryCapabilitySurface.schemaVersionVersionLabel;
export const schemaVersionLockLabel = repositoryCapabilitySurface.schemaVersionLockLabel;
export const schemaVersionReadOnlyDerivedField = repositoryCapabilitySurface.schemaVersionReadOnlyDerivedField;
export const schemaVersionDerivedInspectionSurface = repositoryCapabilitySurface.schemaVersionDerivedInspectionSurface;
export const schemaVersionSurfaceVersion = repositoryCapabilitySurface.schemaVersionSurfaceVersion;
export const shallowImmutabilityWitness = repositoryCapabilitySurface.shallowImmutabilityWitness;
export const immutableDerivedSnapshot = repositoryCapabilitySurface.immutableDerivedSnapshot;
export const schemaVersionSchemaStabilityWitness = repositoryCapabilitySurface.schemaVersionSchemaStabilityWitness;
export const schemaVersionBoundaryExport = repositoryCapabilitySurface.schemaVersionBoundaryExport;
