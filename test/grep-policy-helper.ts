import { expect } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export interface GrepPolicyExpectation {
  file: string;
  allowedPatterns?: readonly string[];
}

export function collectTypeScriptFiles(
  scanRoots: readonly string[],
  excludedFiles: ReadonlySet<string> = new Set()
): string[] {
  const files: string[] = [];

  for (const scanRoot of scanRoots) {
    const stack = [scanRoot];

    while (stack.length > 0) {
      const currentPath = stack.pop();
      if (!currentPath) continue;

      const absolutePath = join(process.cwd(), currentPath);
      const stats = statSync(absolutePath);
      if (stats.isDirectory()) {
        for (const entry of readdirSync(absolutePath)) {
          stack.push(join(currentPath, entry));
        }
        continue;
      }

      if (currentPath.endsWith(".ts") && !excludedFiles.has(currentPath)) {
        files.push(currentPath);
      }
    }
  }

  return files.sort();
}

export function assertSourcesDoNotContainPatterns(
  sourceExpectations: readonly GrepPolicyExpectation[],
  disallowedPatterns: readonly string[]
): void {
  for (const { file, allowedPatterns = [] } of sourceExpectations) {
    const source = readFileSync(join(process.cwd(), file), "utf8");
    const sanitized = allowedPatterns.reduce(
      (currentSource, allowedPattern) => currentSource.replaceAll(allowedPattern, ""),
      source
    );

    for (const pattern of disallowedPatterns) {
      expect(sanitized).not.toContain(pattern);
    }
  }
}
