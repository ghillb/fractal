import { webSearchTool } from "../../../../src/tools/web-search.ts";

async function main(): Promise<void> {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error("Usage: bun run .agents/skills/web-search/scripts/perplexity.ts \"<query>\"");
    process.exit(1);
  }

  const result = await webSearchTool({ query });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(msg);
  process.exit(1);
});
