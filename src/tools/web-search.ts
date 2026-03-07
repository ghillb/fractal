import { fetchWithTimeout } from "../core/http.ts";
import type { ToolCallInput } from "./types.ts";

export async function webSearchTool(input: ToolCallInput): Promise<Record<string, unknown>> {
  const query = String(input.query ?? "").trim();
  if (!query) {
    throw new Error("query is required");
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is required for web_search.");
  }

  const response = await fetchWithTimeout(
    "https://api.perplexity.ai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "Return concise web search results as JSON array with keys: title,url,snippet. No markdown."
          },
          {
            role: "user",
            content: query
          }
        ],
        temperature: 0
      })
    },
    15000
  );

  if (!response.ok) {
    throw new Error(`Perplexity error: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  let parsed: Array<{ title: string; url: string; snippet: string }> = [];

  try {
    const maybeArray = JSON.parse(content) as unknown;
    if (Array.isArray(maybeArray)) {
      parsed = maybeArray
        .map((row) => {
          const entry = row as Record<string, unknown>;
          return {
            title: String(entry.title ?? "Untitled"),
            url: String(entry.url ?? ""),
            snippet: String(entry.snippet ?? "")
          };
        })
        .filter((row) => row.url.length > 0)
        .slice(0, 8);
    }
  } catch {
    const citations = data.citations ?? [];
    parsed = citations.slice(0, 8).map((url, index) => ({
      title: `Result ${index + 1}`,
      url,
      snippet: content.slice(0, 220)
    }));
  }

  return { query, results: parsed };
}
