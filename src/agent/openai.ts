import { fetchWithTimeout } from "../core/http.ts";

export type ResponsesTool = {
  type: "function";
  name: string;
  description: string;
  parameters: unknown;
};

export type ResponseOutputItem = {
  type: string;
  id?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  role?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

export type OpenAiResponse = {
  id: string;
  output?: ResponseOutputItem[];
};

export async function openAiResponses(
  apiKey: string,
  payload: {
    model: string;
    input: unknown;
    tools?: ResponsesTool[];
    previousResponseId?: string;
  }
): Promise<OpenAiResponse> {
  const body: Record<string, unknown> = {
    model: payload.model,
    input: payload.input
  };

  if (payload.tools && payload.tools.length > 0) {
    body.tools = payload.tools;
  }

  if (payload.previousResponseId) {
    body.previous_response_id = payload.previousResponseId;
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      },
      45000
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`OpenAI request failed for model ${payload.model}: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${(await response.text()).slice(0, 1200)}`);
  }

  const data = (await response.json()) as OpenAiResponse;
  if (!data.id) {
    throw new Error("OpenAI returned invalid response id");
  }

  return data;
}

export function extractOutputText(items: ResponseOutputItem[] | undefined): string {
  if (!items) {
    return "";
  }

  const chunks: string[] = [];
  for (const item of items) {
    if (item.type !== "message" || !item.content) {
      continue;
    }
    for (const part of item.content) {
      if (part.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

export function extractFunctionCalls(items: ResponseOutputItem[] | undefined): Array<{
  callId: string;
  name: string;
  argumentsText: string;
}> {
  if (!items) {
    return [];
  }

  return items
    .filter((item) => item.type === "function_call")
    .map((item) => ({
      callId: item.call_id ?? "",
      name: item.name ?? "",
      argumentsText: item.arguments ?? "{}"
    }))
    .filter((call) => call.callId && call.name);
}
