export interface AiClientOptions {
  baseURL?: string;
  allowBrowser?: boolean;
  referer?: string;
  appTitle?: string;
}

export type AiRole = "system" | "user" | "assistant";

export interface AiTextMessage {
  role: AiRole;
  content: string;
}

export interface AiClient {
  extractTextFromImage(args: {
    apiKey: string;
    model: string;
    imageData: string;
    prompt: string;
  }): Promise<string>;

  askModel(args: {
    apiKey: string;
    model: string;
    systemPrompt?: string;
    userPrompt: string;
    temperature?: number;
  }): Promise<string>;

  askModelFollowup(args: {
    apiKey: string;
    model: string;
    conversation: AiTextMessage[];
    temperature?: number;
  }): Promise<string>;

  listModels(args?: {
    apiKey?: string;
  }): Promise<Array<{ id: string; [key: string]: unknown }>>;
}
