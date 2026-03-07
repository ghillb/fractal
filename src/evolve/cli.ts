import { runEvolveCycle } from "./cycle.ts";

function parseFlags(argv: string[]): { dryRun: boolean } {
  return {
    dryRun: argv.includes("--dry-run")
  };
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2));
  await runEvolveCycle({
    dryRun: flags.dryRun
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`evolve cycle failed: ${message}`);
  process.exit(1);
});
