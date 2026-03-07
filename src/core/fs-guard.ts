import { realpathSync } from "node:fs";
import { resolve, sep } from "node:path";

const BLOCKED_SEGMENTS = [".git", ".env", ".env.keys"];

export function assertWithinWorkspace(workspaceRoot: string, targetPath: string): string {
  const root = realpathSync(workspaceRoot);
  const resolved = resolve(root, targetPath);

  if (!(resolved === root || resolved.startsWith(root + sep))) {
    throw new Error(`Path escapes workspace: ${targetPath}`);
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
