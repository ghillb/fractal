import { runAgent } from "./runner.ts";

async function main(): Promise<void> {
  const task = process.argv.slice(2).join(" ").trim();
  if (!task) {
    console.error("Usage: bun run agent -- \"<task>\"");
    process.exit(1);
  }

  const result = await runAgent({ task, mode: "normal" });
  console.log(result.output);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`agent failed: ${message}`);
  process.exit(1);
});
