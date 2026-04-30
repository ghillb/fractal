export const LIFECYCLE_VERSION = 1 as const;

export type LifecycleStatus = Readonly<{
  phase: "boot" | "ready" | "idle";
  active: boolean;
  description: string;
}>;

export type LifecycleInspection = Readonly<{
  version: typeof LIFECYCLE_VERSION;
  readOnly: true;
  domain: "lifecycle";
  status: LifecycleStatus;
}>;

const lifecycleStatus: LifecycleStatus = Object.freeze({
  phase: "ready",
  active: true,
  description: "Stable lifecycle status for automation and structured introspection."
});

const lifecycleInspection: LifecycleInspection = Object.freeze({
  version: LIFECYCLE_VERSION,
  readOnly: true,
  domain: "lifecycle",
  status: lifecycleStatus
});

export function getLifecycleInspection(): LifecycleInspection {
  return lifecycleInspection;
}

export function exportLifecycleInspection(): LifecycleInspection {
  return lifecycleInspection;
}
