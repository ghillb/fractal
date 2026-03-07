import { fetchWithTimeout } from "../core/http.ts";
import type { OpenAiToolSpec } from "../tools/types.ts";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
};

export type OpenAiChatResponse = {
  message: ChatMessage;
  usage?: { total_tokens?: number };
};

function normalizeContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        const maybe = part as { type?: string; text?: string };
        return maybe.type === "text" ? maybe.text ?? "" : "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

export async function openAiChatCompletion(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  tools: OpenAiToolSpec[]
): Promise<OpenAiChatResponse> {
  const response = await fetchWithTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        tools,
        tool_choice: "auto",
        temperature: 0.2
      })
    },
    30000
  );

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${(await response.text()).slice(0, 1200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: ChatMessage & { content?: unknown } }>;
    usage?: { total_tokens?: number };
  };

  const choice = data.choices?.[0]?.message;
  if (!choice) {
    throw new Error("OpenAI returned empty completion");
  }

  return {
    message: {
      ...choice,
      content: normalizeContent(choice.content)
    },
    usage: data.usage
  };
}
