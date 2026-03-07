import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { exec } from "../core/shell.ts";
import type { ToolCallInput } from "./types.ts";

export type SpritesConfig = {
  enabled: boolean;
  defaultName: string;
  timeoutSeconds: number;
  retries: number;
};

function requireSpritesEnabled(config: SpritesConfig): void {
  if (!config.enabled) {
    throw new Error("Sprites is disabled. Set SPRITES_ENABLED=true to enable remote build execution.");
  }

  const probe = exec("command -v sprite");
  if (probe.code !== 0) {
    throw new Error("Sprites CLI not found. Install it first: https://sprites.dev");
  }
}

function withTimeout(cmd: string, seconds: number): string {
  return `timeout ${seconds}s bash -lc ${JSON.stringify(cmd)}`;
}

function runWithRetry(cmd: string, retries: number): { code: number; stdout: string; stderr: string } {
  let last = { code: 1, stdout: "", stderr: "" };
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    last = exec(cmd);
    if (last.code === 0) {
      return last;
    }
  }
  return last;
}

export async function spriteCreate(name: string, config: SpritesConfig): Promise<Record<string, unknown>> {
  requireSpritesEnabled(config);
  const result = runWithRetry(withTimeout(`sprite create ${name}`, config.timeoutSeconds), config.retries);
  if (result.code !== 0) {
    throw new Error(`sprite create failed: ${result.stderr}`);
  }
  return { name, output: result.stdout.trim() };
}

export async function spriteExec(name: string, command: string, config: SpritesConfig): Promise<Record<string, unknown>> {
  requireSpritesEnabled(config);
  const quoted = JSON.stringify(command);
  const cmd = withTimeout(`sprite exec -s ${name} -- bash -lc ${quoted}`, config.timeoutSeconds);
  const result = runWithRetry(cmd, config.retries);
  return {
    name,
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr
  };
}

export async function spriteApiGet(name: string, path: string, config: SpritesConfig): Promise<Record<string, unknown>> {
  requireSpritesEnabled(config);
  const endpoint = `/v1/sprites/${name}/fs/read?path=${encodeURIComponent(path)}`;
  const cmd = withTimeout(`sprite api GET ${JSON.stringify(endpoint)}`, config.timeoutSeconds);
  const result = runWithRetry(cmd, config.retries);
  if (result.code !== 0) {
    throw new Error(`sprite api failed: ${result.stderr}`);
  }
  return { name, endpoint, response: result.stdout };
}

export async function spriteDestroy(name: string, config: SpritesConfig): Promise<Record<string, unknown>> {
  const probe = exec("command -v sprite");
  if (probe.code !== 0) {
    return { name, skipped: true, reason: "sprite cli unavailable" };
  }

  const cmd = withTimeout(`sprite destroy -s ${name} --force`, config.timeoutSeconds);
  const result = runWithRetry(cmd, config.retries);
  return { name, code: result.code, stdout: result.stdout, stderr: result.stderr };
}

export async function spriteEphemeralWorkflow(input: ToolCallInput, config: SpritesConfig): Promise<Record<string, unknown>> {
  requireSpritesEnabled(config);

  const checkpoint = Boolean(input.checkpoint ?? false);
  const spriteName = String(input.name ?? config.defaultName);
  const buildCommand = String(input.command ?? "bun run lint && bun test");
  const artifactPath = String(input.artifactPath ?? "");

  let checkpointRef = "";
  if (checkpoint) {
    const cp = exec("git rev-parse --verify HEAD");
    checkpointRef = cp.stdout.trim();
  }

  await spriteCreate(spriteName, config);
  const tempDir = await mkdtemp(join(tmpdir(), "fractal-sprite-"));
  const tarFile = join(tempDir, "source.tgz");

  try {
    const tarPack = exec(`tar --exclude=.git --exclude=node_modules -czf ${JSON.stringify(tarFile)} .`);
    if (tarPack.code !== 0) {
      throw new Error(`failed to archive workspace: ${tarPack.stderr}`);
    }

    const upload = exec(
      withTimeout(
        `sprite exec -s ${spriteName} -- bash -lc ${JSON.stringify("mkdir -p /workspace && cat > /workspace/source.tgz")} < ${JSON.stringify(tarFile)}`,
        config.timeoutSeconds
      )
    );
    if (upload.code !== 0) {
      throw new Error(`failed to upload archive: ${upload.stderr}`);
    }

    const extract = await spriteExec(
      spriteName,
      "cd /workspace && tar -xzf source.tgz && rm source.tgz",
      config
    );
    if (Number(extract.code) !== 0) {
      throw new Error(`failed to extract source: ${String(extract.stderr)}`);
    }

    const run = await spriteExec(spriteName, `cd /workspace && ${buildCommand}`, config);
    const result: Record<string, unknown> = {
      spriteName,
      checkpointRef,
      command: buildCommand,
      run
    };

    if (artifactPath) {
      const remoteRead = await spriteApiGet(spriteName, artifactPath, config);
      const outDir = join(process.cwd(), ".fractal", "artifacts");
      await mkdir(outDir, { recursive: true });
      const outPath = join(outDir, basename(artifactPath));
      await writeFile(outPath, String(remoteRead.response), "utf8");
      const saved = await readFile(outPath, "utf8");
      result.artifact = { path: outPath, bytes: Buffer.byteLength(saved, "utf8") };
    }

    return result;
  } finally {
    await spriteDestroy(spriteName, config);
    await rm(tempDir, { recursive: true, force: true });
  }
}
