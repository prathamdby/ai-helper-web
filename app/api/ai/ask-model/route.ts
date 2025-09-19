import { type NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import type { AiProvider } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, provider, model, systemPrompt, userPrompt, temperature } =
      await request.json();

    if (!(((apiKey && provider ) && model ) && userPrompt)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      `[${provider.toUpperCase()}] Server-side model request: ${model}`
    );

    const ai = createAiClient({
      provider: provider as AiProvider,
      allowBrowser: false, // Server-side only
    });

    const response = await ai.askModel({
      apiKey,
      model,
      systemPrompt,
      userPrompt,
      temperature,
    });

    console.log(
      `[${provider.toUpperCase()}] Model response completed, length: ${response.length}`
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI API] Ask model error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
