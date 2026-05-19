import { capabilitySnapshot } from "./capability-snapshot.ts";

export const REPOSITORY_CAPABILITY_SURFACE_VERSION = 3 as const;

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
    value: "src/repository-capability-surface.ts@4";
    derived: true;
  }>;
  schemaVersionTag: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface/v3";
    derived: true;
  }>;
  schemaSignature: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: "repository-capability-surface@3";
    derived: true;
  }>;
  schemaVersion: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: 3;
    derived: true;
  }>;
  versionedReadOnly: Readonly<{
    version: typeof REPOSITORY_CAPABILITY_SURFACE_VERSION;
    value: true;
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
    value: "src/repository-capability-surface.ts@4",
    derived: true
  }),
  schemaVersionTag: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface/v3",
    derived: true
  }),
  schemaSignature: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: "repository-capability-surface@3",
    derived: true
  }),
  schemaVersion: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: 3,
    derived: true
  }),
  versionedReadOnly: Object.freeze({
    version: REPOSITORY_CAPABILITY_SURFACE_VERSION,
    value: true,
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
