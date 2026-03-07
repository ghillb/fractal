export type ExecResult = {
  code: number;
  stdout: string;
  stderr: string;
};

export function exec(cmd: string, cwd = process.cwd()): ExecResult {
  const proc = Bun.spawnSync(["bash", "-lc", cmd], {
    cwd,
    stdout: "pipe",
    stderr: "pipe"
  });

  return {
    code: proc.exitCode,
    stdout: new TextDecoder().decode(proc.stdout),
    stderr: new TextDecoder().decode(proc.stderr)
  };
}
