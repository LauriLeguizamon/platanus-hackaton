import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import type { SocialPlatform } from "@/lib/types";

const PLATFORM_INSTRUCTIONS: Record<SocialPlatform, string> = {
  instagram: `Write an Instagram caption (max 2200 chars). Include:
- An attention-grabbing opening line
- 2-3 short paragraphs with emojis
- A call to action (e.g., "Shop now", "Link in bio")
- 15-20 relevant hashtags on a separate line at the end
- Use line breaks for readability`,

  twitter: `Write a Twitter/X post (max 280 characters total). Include:
- A punchy, concise message
- 1-2 emojis maximum
- 2-3 relevant hashtags inline
- Must fit within 280 characters total`,

  linkedin: `Write a LinkedIn post (max 3000 chars). Include:
- A professional, compelling opening hook
- 2-3 paragraphs about the product value proposition
- Professional tone with subtle emojis (1-2 max)
- A business-oriented call to action
- 3-5 relevant hashtags at the end`,

  tiktok: `Write a TikTok caption (max 2200 chars). Include:
- A trendy, Gen-Z friendly opening hook
- Short, punchy text with relevant emojis
- A call to action (e.g., "Link in bio", "Comment below")
- 5-8 trending and relevant hashtags
- Keep it casual and engaging`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, platform, prompt } = body as {
      imageUrl: string;
      platform: SocialPlatform;
      prompt?: string;
    };

    if (!imageUrl || !platform) {
      return NextResponse.json(
        { error: "imageUrl and platform are required" },
        { status: 400 }
      );
    }

    const platformInstructions = PLATFORM_INSTRUCTIONS[platform];
    if (!platformInstructions) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a social media marketing expert. Generate a marketing-optimized social media caption for a product image. The caption should be compelling, drive engagement, and encourage action.\n\n${platformInstructions}`;

    const userMessage = prompt
      ? `This is a product photo. The original generation prompt was: "${prompt}". Generate a marketing-optimized social media caption for this product image.`
      : `This is a product photo. Generate a marketing-optimized social media caption for this product image.`;

    const result = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              image: new URL(imageUrl),
            },
            {
              type: "text",
              text: userMessage,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      caption: result.text,
      platform,
    });
  } catch (error) {
    console.error("Caption generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Caption generation failed",
      },
      { status: 500 }
    );
  }
}
