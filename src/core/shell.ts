export type ExecResult = {
  code: number;
  stdout: string;
  stderr: string;
};

export type ExecOptions = {
  cwd?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
};

export function exec(cmd: string, options: ExecOptions | string = {}): ExecResult {
  const normalized = typeof options === "string" ? { cwd: options } : options;
  const proc = Bun.spawnSync(["bash", "-lc", cmd], {
    cwd: normalized.cwd ?? process.cwd(),
    env: normalized.env,
    timeout: normalized.timeoutMs,
    killSignal: "SIGTERM",
    stdout: "pipe",
    stderr: "pipe"
  });

  return {
    code: proc.exitCode,
    stdout: new TextDecoder().decode(proc.stdout),
    stderr: new TextDecoder().decode(proc.stderr)
  };
}
