import { realpathSync } from "node:fs";
import { resolve, sep } from "node:path";

const BLOCKED_SEGMENTS = [".git", ".env", ".env.keys"];

// Keep this list short and explicit: it documents the protection contract for
// repository state that should not be rewritten by autonomous edits. JOURNAL.md
// and src/evolve/journal.ts are existing guarded cases for the evolution
// journal/self-state path, so future sensitive files should only be added here
// with the same level of rationale rather than expanding broad path matching.
export const BLOCKED_PATHS = ["JOURNAL.md", "src/evolve/journal.ts"];

export function assertWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = realpathSync(workspaceRoot);
  const resolved = resolve(root, targetPath);

  if (!(resolved === root || resolved.startsWith(root + sep))) {
    throw new Error(`Path escapes workspace: ${targetPath}`);
  }

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
