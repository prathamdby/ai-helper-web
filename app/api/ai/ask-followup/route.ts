import { type NextRequest, NextResponse } from "next/server";
import { createAiClient } from "@/lib/ai/client";
import type { AiProvider } from "@/lib/store";
import type { AiTextMessage } from "@/lib/ai/types";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, provider, model, conversation, temperature } =
      await request.json();

    if (!(((apiKey && provider ) && model ) && conversation)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(
      `[${provider.toUpperCase()}] Server-side follow-up: ${model}, ${conversation.length} messages`
    );

    const ai = createAiClient({
      provider: provider as AiProvider,
      allowBrowser: false, // Server-side only
    });

    const response = await ai.askModelFollowup({
      apiKey,
      model,
      conversation: conversation as AiTextMessage[],
      temperature,
    });

    console.log(
      `[${provider.toUpperCase()}] Follow-up completed, length: ${response.length}`
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI API] Ask followup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
