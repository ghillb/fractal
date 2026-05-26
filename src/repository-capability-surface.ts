import { capabilitySnapshot } from "./capability-snapshot.ts";

export const REPOSITORY_CAPABILITY_SURFACE_VERSION = 5 as const;

export type RepositoryCapabilitySurface = Readonly<{
  version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
  readOnly: true;
  derivedVersion: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
  exportVisibility: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    visible: true;
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
    value: "src/repository-capability-surface.ts@7";
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
}>;

const repositoryCapabilitySurface: RepositoryCapabilitySurface = Object.freeze({
  version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
  readOnly: true,
  derivedVersion: REPOSITORY_CAPABILITY_SURFACE_VERSION,
  exportVisibility: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    visible: true,
    derived: true
  }),
  schemaStability: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    stable: true,
    derived: true
  }),
  publicShape: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    shape: "versioned-readonly-derived-surface",
    derived: true
  }),
  publicShapeSignature: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "versioned-readonly-derived-surface",
    derived: true
  }),
  sourceFingerprint: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "src/repository-capability-surface.ts@7",
    derived: true
  }),
  introspectionTier: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "telemetry-adjacent",
    derived: true
  }),
  schemaVersionTag: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface/v4",
    derived: true
  }),
  schemaSignature: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface@4",
    derived: true
  }),
  schemaVersion: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: 4,
    derived: true
  }),
  schemaVersionLabel: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface-schema@4",
    derived: true
  }),
  schemaVersionDigest: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface-schema@4#stable",
    derived: true
  }),
  versionedReadOnly: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: true,
    derived: true
  }),
  exportContractVersion: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    derived: true
  }),
  versionedSchemaContract: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: `repository-capability-surface/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`,
    derived: true
  }),
  schemaVersionedSurface: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: `repository-capability-surface-schema/v${REPOSITORY_CAPABILITY_SURFACE_VERSION}`,
    derived: true
  })
});

export type VersionedRepositoryCapabilitySurface = Readonly<{
  version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
  readOnly: true;
  surface: RepositoryCapabilitySurface;
}>;

export function exportRepositoryCapabilitySurface(): RepositoryCapabilitySurface {
  return repositoryCapabilitySurface;
}

export function getRepositoryCapabilitySurface(): RepositoryCapabilitySurface {
  return repositoryCapabilitySurface;
}

export function getVersionedRepositoryCapabilitySurface(): VersionedRepositoryCapabilitySurface {
  return Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    readOnly: true,
    surface: repositoryCapabilitySurface
  });
}

export const repositoryCapabilityExport = Object.freeze({
  capabilitySnapshot,
  surface: repositoryCapabilitySurface
});
