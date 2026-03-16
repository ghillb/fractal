import { realpathSync } from "node:fs";
import { resolve, sep } from "node:path";

// Keep this list short and explicit: it documents the protection contract for
// repository state that should not be rewritten by autonomous edits.
//
// Access-mode contract: these rules are for mutating access only. Callers may
// still inspect protected paths for legitimate read/non-mutating workflows, but
// any write/create/delete/rename operation targeting these paths must be
// rejected. `segments` guards sensitive names anywhere in the path, while
// `paths` enumerates exact workspace-relative files that represent protected
// self-state.
export const PROTECTED_PATH_RULES = {
  segments: [".git", ".env", ".env.keys"],
  paths: ["JOURNAL.md", "src/evolve/journal.ts"]
} as const;

export const BLOCKED_SEGMENTS = PROTECTED_PATH_RULES.segments;
export const BLOCKED_PATHS = PROTECTED_PATH_RULES.paths;

export enum WorkspaceAccessMode {
  Read = "read",
  Mutate = "mutate"
}

function resolveWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = realpathSync(workspaceRoot);
  const resolved = resolve(root, targetPath);

  if (!(resolved === root || resolved.startsWith(root + sep))) {
    throw new Error(`Path escapes workspace: ${targetPath}`);
  }

  return resolved;
}

export function assertReadableWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  return resolveWithinWorkspace(workspaceRoot, targetPath);
}

export function assertMutableWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = realpathSync(workspaceRoot);
  const resolved = resolveWithinWorkspace(root, targetPath);

  for (const blockedPath of BLOCKED_PATHS) {
    const blockedResolved = resolve(root, blockedPath);
    if (resolved === blockedResolved) {
      throw new Error(`Blocked protected path: ${blockedPath}`);
    }
  }

  for (const segment of BLOCKED_SEGMENTS) {
    if (resolved.includes(`${sep}${segment}`) || resolved.endsWith(segment)) {
      throw new Error(`Blocked path segment: ${segment}`);
    }
  }

  return resolved;
}

export function assertWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  return assertMutableWithinWorkspace(workspaceRoot, targetPath);
}

export function assertWithinWorkspaceForAccess(
  workspaceRoot: string,
  targetPath: string,
  accessMode: WorkspaceAccessMode
): string {
  return accessMode === WorkspaceAccessMode.Read
    ? assertReadableWithinWorkspace(workspaceRoot, targetPath)
    : assertMutableWithinWorkspace(workspaceRoot, targetPath);
}

export function isCompileHeavyTask(task: string): boolean {
  const lowered = task.toLowerCase();
  const needles = [
    "rust",
    "cargo",
    "go build",
    "golang",
    "cmake",
    "c++",
    "clang",
    "gcc",
    "native",
    "toolchain",
    "compile",
    "linker"
  ];
  return needles.some((needle) => lowered.includes(needle));
}
