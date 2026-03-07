export type Json = unknown;

export type ToolCallInput = Record<string, Json>;

export type ToolContext = {
  workspaceRoot: string;
};

export type ToolHandler = (input: ToolCallInput, context: ToolContext) => Promise<Json>;

export type OpenAiToolSpec = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Json;
  };
};

export type RegisteredTool = {
  spec: OpenAiToolSpec;
  run: ToolHandler;
};
