import OpenAI from "openai";
import type { AiClient, AiClientOptions, AiTextMessage } from "./types";

const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export function createAiClient(options: AiClientOptions = {}): AiClient {
  const baseURL = options.baseURL || DEFAULT_BASE_URL;
  const allowBrowser = options.allowBrowser ?? true;

  function buildClient(apiKey: string): OpenAI {
    return new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: allowBrowser,
      defaultHeaders: {
        ...(options.referer ? { "HTTP-Referer": options.referer } : {}),
        ...(options.appTitle ? { "X-Title": options.appTitle } : {}),
      },
    });
  }

  type ImagePart = { type: "image_url"; image_url: { url: string } };
  type TextPart = { type: "text"; text: string };
  type MultimodalUserContent = Array<ImagePart | TextPart>;

  async function extractTextFromImage(args: {
    apiKey: string;
    model: string;
    imageData: string;
    prompt: string;
  }): Promise<string> {
    const { apiKey, model, imageData, prompt } = args;
    const client = buildClient(apiKey);
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageData } },
            ] as MultimodalUserContent,
          },
        ],
      });
      const text = res.choices?.[0]?.message?.content?.trim() ?? "";
      return text;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function askModel(args: {
    apiKey: string;
    model: string;
    systemPrompt?: string;
    userPrompt: string;
    temperature?: number;
  }): Promise<string> {
    const { apiKey, model, systemPrompt, userPrompt, temperature } = args;
    const client = buildClient(apiKey);
    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (systemPrompt)
        messages.push({ role: "system", content: systemPrompt });
      messages.push({ role: "user", content: userPrompt });

      const res = await client.chat.completions.create({
        model,
        temperature,
        messages,
      });
      return res.choices?.[0]?.message?.content?.trim() ?? "";
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function askModelFollowup(args: {
    apiKey: string;
    model: string;
    conversation: AiTextMessage[];
    temperature?: number;
  }): Promise<string> {
    const { apiKey, model, conversation, temperature } = args;
    const client = buildClient(apiKey);
    try {
      const res = await client.chat.completions.create({
        model,
        temperature,
        messages: conversation.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      return res.choices?.[0]?.message?.content?.trim() ?? "";
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async function listModels(args?: {
    apiKey?: string;
  }): Promise<Array<{ id: string; [key: string]: unknown }>> {
    const client = buildClient(args?.apiKey ?? "");
    try {
      const res = await client.models.list();
      // Return raw models (at least the id), so callers can filter on pricing if available
      return res.data as Array<{ id: string }>;
    } catch (error) {
      throw normalizeError(error);
    }
  }

  return {
    extractTextFromImage,
    askModel,
    askModelFollowup,
    listModels,
  };
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}
