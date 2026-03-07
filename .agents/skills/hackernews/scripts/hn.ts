import { hackernewsCommentsTool, hackernewsSearchTool, hackernewsTrendingTool } from "../../../../src/tools/hackernews.ts";

function readFlag(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return fallback;
  }
  return process.argv[idx + 1] ?? fallback;
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === "front") {
    const n = Number(readFlag("-n", "20"));
    const data = await hackernewsTrendingTool({ hours: 72, minPoints: 1, n });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (command === "trending") {
    const hours = Number(readFlag("--hours", "24"));
    const minPoints = Number(readFlag("--min-points", "100"));
    const n = Number(readFlag("-n", "15"));
    const data = await hackernewsTrendingTool({ hours, minPoints, n });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (command === "search") {
    const query = rest[0] ?? "";
    const minPoints = Number(readFlag("--min-points", "0"));
    const n = Number(readFlag("-n", "10"));
    const data = await hackernewsSearchTool({ query, minPoints, n });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (command === "comments") {
    const itemId = rest[0] ?? "";
    const n = Number(readFlag("-n", "20"));
    const data = await hackernewsCommentsTool({ itemId, n });
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.error("Unknown command. Use front|trending|search|comments");
  process.exit(1);
}

main().catch((error) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(msg);
  process.exit(1);
});
