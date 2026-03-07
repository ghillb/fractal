import { fetchUrlTool } from "./fetch-url.ts";
import { listFilesTool, readFileTool, writeFileTool } from "./file-ops.ts";
import {
  hackernewsCommentsTool,
  hackernewsSearchTool,
  hackernewsTrendingTool
} from "./hackernews.ts";
import { runCommandTool } from "./command.ts";
import type { RegisteredTool } from "./types.ts";
import { webSearchTool } from "./web-search.ts";

export function createTools(): Map<string, RegisteredTool> {
  const tools: Array<[string, RegisteredTool]> = [
    [
      "run_command",
      {
        spec: {
          type: "function",
          function: {
            name: "run_command",
            description: "Run a local non-interactive shell command in workspace.",
            parameters: {
              type: "object",
              properties: {
                command: { type: "string" }
              },
              required: ["command"]
            }
          }
        },
        run: async (input) => runCommandTool(input)
      }
    ],
    [
      "fetch_url",
      {
        spec: {
          type: "function",
          function: {
            name: "fetch_url",
            description: "Fetch URL content safely with timeout and truncation.",
            parameters: {
              type: "object",
              properties: {
                url: { type: "string" }
              },
              required: ["url"]
            }
          }
        },
        run: async (input) => fetchUrlTool(input)
      }
    ],
    [
      "web_search",
      {
        spec: {
          type: "function",
          function: {
            name: "web_search",
            description: "Search web with Perplexity and return structured result snippets.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" }
              },
              required: ["query"]
            }
          }
        },
        run: async (input) => webSearchTool(input)
      }
    ],
    [
      "hackernews_trending",
      {
        spec: {
          type: "function",
          function: {
            name: "hackernews_trending",
            description: "Fetch HN trending stories in a lookback window.",
            parameters: {
              type: "object",
              properties: {
                hours: { type: "number" },
                minPoints: { type: "number" },
                n: { type: "number" }
              }
            }
          }
        },
        run: async (input) => hackernewsTrendingTool(input)
      }
    ],
    [
      "hackernews_search",
      {
        spec: {
          type: "function",
          function: {
            name: "hackernews_search",
            description: "Search HN stories by query.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" },
                minPoints: { type: "number" },
                n: { type: "number" }
              },
              required: ["query"]
            }
          }
        },
        run: async (input) => hackernewsSearchTool(input)
      }
    ],
    [
      "hackernews_comments",
      {
        spec: {
          type: "function",
          function: {
            name: "hackernews_comments",
            description: "Fetch top comments for a Hacker News story item id.",
            parameters: {
              type: "object",
              properties: {
                itemId: { type: "string" },
                n: { type: "number" }
              },
              required: ["itemId"]
            }
          }
        },
        run: async (input) => hackernewsCommentsTool(input)
      }
    ],
    [
      "list_files",
      {
        spec: {
          type: "function",
          function: {
            name: "list_files",
            description: "List files under workspace by glob pattern.",
            parameters: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                max: { type: "number" }
              }
            }
          }
        },
        run: async (input, context) => listFilesTool(input, context)
      }
    ],
    [
      "read_file",
      {
        spec: {
          type: "function",
          function: {
            name: "read_file",
            description: "Read a UTF-8 file in the repository workspace.",
            parameters: {
              type: "object",
              properties: {
                path: { type: "string" },
                maxChars: { type: "number" }
              },
              required: ["path"]
            }
          }
        },
        run: async (input, context) => readFileTool(input, context)
      }
    ],
    [
      "write_file",
      {
        spec: {
          type: "function",
          function: {
            name: "write_file",
            description: "Write a UTF-8 file in the repository workspace.",
            parameters: {
              type: "object",
              properties: {
                path: { type: "string" },
                content: { type: "string" }
              },
              required: ["path", "content"]
            }
          }
        },
        run: async (input, context) => writeFileTool(input, context)
      }
    ]
  ];

  return new Map(tools);
}
