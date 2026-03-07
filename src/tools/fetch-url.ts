import { fetchWithTimeout } from "../core/http.ts";
import type { ToolCallInput } from "./types.ts";

const MAX_BYTES = 20000;

export async function fetchUrlTool(input: ToolCallInput): Promise<Record<string, unknown>> {
  const url = String(input.url ?? "").trim();
  if (!url) {
    throw new Error("url is required");
  }

  const response = await fetchWithTimeout(url, {}, 12000);
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  const truncated = body.slice(0, MAX_BYTES);

  return {
    ok: response.ok,
    status: response.status,
    contentType,
    truncated: body.length > MAX_BYTES,
    content: truncated
  };
}
