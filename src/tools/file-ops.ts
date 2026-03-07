import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { assertWithinWorkspace } from "../core/fs-guard.ts";
import type { ToolCallInput, ToolContext } from "./types.ts";

export async function listFilesTool(input: ToolCallInput, context: ToolContext): Promise<Record<string, unknown>> {
  const pattern = String(input.pattern ?? "**/*");
  const max = Math.min(Number(input.max ?? 100), 300);
  const files: string[] = [];
  const glob = new Bun.Glob(pattern);

  for await (const file of glob.scan({
    cwd: context.workspaceRoot,
    absolute: false
  })) {
    const asString = file;
    if (asString.startsWith(".git/") || asString.startsWith("node_modules/")) {
      continue;
    }
    files.push(asString);
    if (files.length >= max) {
      break;
    }
  }

  return { pattern, files };
}

export async function readFileTool(input: ToolCallInput, context: ToolContext): Promise<Record<string, unknown>> {
  const path = String(input.path ?? "");
  const maxChars = Math.min(Number(input.maxChars ?? 10000), 120000);
  if (!path) {
    throw new Error("path is required");
  }

  const resolved = assertWithinWorkspace(context.workspaceRoot, path);
  const content = await readFile(resolved, "utf8");
  return {
    path: relative(context.workspaceRoot, resolved),
    truncated: content.length > maxChars,
    content: content.slice(0, maxChars)
  };
}

export async function writeFileTool(input: ToolCallInput, context: ToolContext): Promise<Record<string, unknown>> {
  const path = String(input.path ?? "");
  const content = String(input.content ?? "");
  if (!path) {
    throw new Error("path is required");
  }

  const resolved = assertWithinWorkspace(context.workspaceRoot, path);
  await mkdir(dirname(resolved), { recursive: true });
  await writeFile(resolved, content, "utf8");

  return {
    path: relative(context.workspaceRoot, resolved),
    bytesWritten: Buffer.byteLength(content, "utf8")
  };
}
