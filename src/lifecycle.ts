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

export type LifecycleDerivedStatus = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  ready: boolean;
  state: "operational" | "transitioning";
}>;

export type LifecycleInspection = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  readOnly: true;
  domain: "lifecycle";
  status: LifecycleStatus;
  summary: LifecycleStatusSummary;
  derivedStatus: LifecycleDerivedStatus;
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

const lifecycleDerivedStatus: LifecycleDerivedStatus = Object.freeze({
  version: LIFECYCLE_VERSION,
  ready: lifecycleStatus.phase === "ready" && lifecycleStatus.active,
  state: lifecycleStatus.phase === "ready" ? "operational" : "transitioning"
});

const lifecycleInspection: LifecycleInspection = Object.freeze({
  version: LIFECYCLE_VERSION,
  readOnly: true,
  domain: "lifecycle",
  status: lifecycleStatus,
  summary: lifecycleSummary,
  derivedStatus: lifecycleDerivedStatus
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
