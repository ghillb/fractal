import { fetchWithTimeout } from "../core/http.ts";
import type { ToolCallInput } from "./types.ts";

const BASE = "https://hn.algolia.com/api/v1";

type HNHit = {
  title?: string;
  url?: string;
  objectID?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at?: string;
  story_title?: string;
  story_url?: string;
  comment_text?: string;
};

type HNStory = {
  title: string;
  url: string;
  hn_url: string;
  points: number;
  comments: number;
  author: string;
  created_at: string;
};

export type HackernewsTrendingResult = {
  hours: number;
  minPoints: number;
  results: Array<Record<string, unknown>>;
};

export type HackernewsSearchResult = {
  query: string;
  minPoints: number;
  results: Array<Record<string, unknown>>;
};

function normalizeStory(hit: HNHit): HNStory {
  const id = hit.objectID ?? "";
  return {
    title: hit.title ?? hit.story_title ?? "Untitled",
    url: hit.url ?? hit.story_url ?? "",
    hn_url: id ? `https://news.ycombinator.com/item?id=${id}` : "",
    points: hit.points ?? 0,
    comments: hit.num_comments ?? 0,
    author: hit.author ?? "",
    created_at: hit.created_at ?? ""
  };
}

async function query(endpoint: string): Promise<HNHit[]> {
  const response = await fetchWithTimeout(endpoint, {}, 12000);
  if (!response.ok) {
    throw new Error(`HN API error ${response.status}`);
  }
  const data = (await response.json()) as { hits?: HNHit[] };
  return data.hits ?? [];
}

export async function hackernewsTrendingTool(input: ToolCallInput): Promise<HackernewsTrendingResult> {
  const hours = Number(input.hours ?? 24);
  const minPoints = Number(input.minPoints ?? 100);
  const n = Number(input.n ?? 15);

  const now = Math.floor(Date.now() / 1000);
  const minTs = now - hours * 3600;
  const endpoint = `${BASE}/search_by_date?tags=story&numericFilters=created_at_i>${minTs},points>${minPoints}&hitsPerPage=${Math.max(1, n * 3)}`;

  const hits = await query(endpoint);
  const rows = hits
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, n)
    .map(normalizeStory);

  return { hours, minPoints, results: rows };
}

export async function hackernewsSearchTool(input: ToolCallInput): Promise<HackernewsSearchResult> {
  const q = encodeURIComponent(String(input.query ?? "").trim());
  const minPoints = Number(input.minPoints ?? 0);
  const n = Number(input.n ?? 10);
  if (!q) {
    throw new Error("query is required");
  }

  const endpoint = `${BASE}/search?query=${q}&tags=story&hitsPerPage=${Math.max(n * 2, 20)}`;
  const hits = await query(endpoint);
  const rows = hits
    .filter((hit) => (hit.points ?? 0) >= minPoints)
    .slice(0, n)
    .map(normalizeStory);

  return { query: decodeURIComponent(q), minPoints, results: rows };
}

export async function hackernewsCommentsTool(input: ToolCallInput): Promise<Record<string, unknown>> {
  const itemId = String(input.itemId ?? "").trim();
  const n = Number(input.n ?? 20);
  if (!itemId) {
    throw new Error("itemId is required");
  }

  const endpoint = `${BASE}/search?tags=comment,story_${encodeURIComponent(itemId)}&hitsPerPage=${Math.max(n, 20)}`;
  const hits = await query(endpoint);

  const comments = hits.slice(0, n).map((hit) => ({
    author: hit.author ?? "",
    created_at: hit.created_at ?? "",
    text: (hit.comment_text ?? "").replaceAll(/<[^>]+>/g, "").slice(0, 700)
  }));

  return { itemId, comments };
}
