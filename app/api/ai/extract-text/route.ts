import { type NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import type { AiProvider } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, provider, model, imageData, prompt } = await request.json();

    if (!((((apiKey && provider ) && model ) && imageData ) && prompt)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      `[${provider.toUpperCase()}] Server-side text extraction with model: ${model}`
    );

    const ai = createAiClient({
      provider: provider as AiProvider,
      allowBrowser: false, // Server-side only
    });

    const text = await ai.extractTextFromImage({
      apiKey,
      model,
      imageData,
      prompt,
    });

    console.log(
      `[${provider.toUpperCase()}] Text extraction completed, length: ${text.length}`
    );

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[AI API] Text extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
