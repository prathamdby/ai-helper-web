import { type NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import type { AiProvider } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, provider } = await request.json();

    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    console.log(`[${provider.toUpperCase()}] Server-side model list request`);

    // Handle Gemini with hardcoded models (no API call needed)
    if (provider === "gemini") {
      const geminiModels = [
        { id: "gemini-2.5-pro" },
        { id: "gemini-2.5-flash" },
        { id: "gemini-2.5-flash-lite" },
        { id: "gemini-2.0-flash" },
        { id: "gemini-2.0-flash-lite" },
      ];
      console.log(`[GEMINI] Returning ${geminiModels.length} hardcoded models`);
      return NextResponse.json({ models: geminiModels });
    }

    // Handle OpenRouter with API call
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required for OpenRouter" },
        { status: 400 }
      );
    }

    const ai = createAiClient({
      provider: provider as AiProvider,
      allowBrowser: false, // Server-side only
    });

    const models = await ai.listModels({ apiKey });
    console.log(
      `[${provider.toUpperCase()}] Retrieved ${models.length} models`
    );

    return NextResponse.json({ models });
  } catch (error) {
    console.error("[AI API] List models error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
