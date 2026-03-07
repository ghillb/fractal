import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { hackernewsSearchTool, hackernewsTrendingTool } from "../src/tools/hackernews.ts";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  globalThis.fetch = ((async () =>
    new Response(
      JSON.stringify({
        hits: [
          {
            title: "A",
            url: "https://example.com/a",
            objectID: "1",
            points: 120,
            num_comments: 10,
            author: "alice",
            created_at: "2026-03-07T00:00:00Z"
          },
          {
            title: "B",
            url: "https://example.com/b",
            objectID: "2",
            points: 30,
            num_comments: 3,
            author: "bob",
            created_at: "2026-03-07T00:00:00Z"
          }
        ]
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )) as unknown) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("hackernews tools", () => {
  test("trending sorts by points", async () => {
    const result = await hackernewsTrendingTool({ hours: 24, minPoints: 0, n: 2 });
    const results = result.results as Array<{ title: string }>;
    expect(results[0]?.title).toBe("A");
  });

  test("search filters min points", async () => {
    const result = await hackernewsSearchTool({ query: "test", minPoints: 100, n: 5 });
    const results = result.results as Array<{ title: string }>;
    expect(results.length).toBe(1);
    expect(results[0]?.title).toBe("A");
  });
});
