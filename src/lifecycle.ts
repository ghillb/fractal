export const LIFECYCLE_VERSION = 1 as const;

export type LifecycleStatus = Readonly<{
  phase: "boot" | "ready" | "idle";
  active: boolean;
  description: string;
}>;

export type LifecycleStatusSummary = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  label: string;
  stable: true;
}>;

export type LifecycleInspection = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  readOnly: true;
  domain: "lifecycle";
  status: LifecycleStatus;
  summary: LifecycleStatusSummary;
}>;

const lifecycleStatus: LifecycleStatus = Object.freeze({
  phase: "ready",
  active: true,
  description: "Stable lifecycle status for automation and structured introspection."
});

const lifecycleSummary: LifecycleStatusSummary = Object.freeze({
  version: LIFECYCLE_VERSION,
  label: lifecycleStatus.phase,
  stable: true
});

const lifecycleInspection: LifecycleInspection = Object.freeze({
  version: LIFECYCLE_VERSION,
  readOnly: true,
  domain: "lifecycle",
  status: lifecycleStatus,
  summary: lifecycleSummary
});

export type VersionedLifecycleInspection = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  readOnly: true;
  inspection: LifecycleInspection;
}>;

export function getLifecycleInspection(): LifecycleInspection {
  return lifecycleInspection;
}

export function getVersionedLifecycleInspection(): VersionedLifecycleInspection {
  return Object.freeze({
    version: LIFECYCLE_VERSION,
    readOnly: true,
    inspection: lifecycleInspection
  });
}

export function exportLifecycleInspection(): LifecycleInspection {
  return lifecycleInspection;
}
