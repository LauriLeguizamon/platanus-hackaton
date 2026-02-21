import { fal } from "@fal-ai/client";
import { VIDEO_MODEL_OPTIONS } from "@/lib/constants";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/db";
import { sessions, generations } from "@/db/schema";
import type {
  GenerateVideoRequest,
  GenerateVideoResponse,
  GenerateVideoErrorResponse,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateVideoResponse | GenerateVideoErrorResponse>> {
  try {
    const body: GenerateVideoRequest = await request.json();

    if (!body.imageUrl || !body.model || !body.prompt) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, model, prompt" },
        { status: 400 }
      );
    }

    const modelConfig = VIDEO_MODEL_OPTIONS.find(
      (m) => m.value === body.model
    );
    if (!modelConfig) {
      return NextResponse.json(
        { error: "Invalid video model" },
        { status: 400 }
      );
    }

    const imageKey = modelConfig.imageInputKey ?? "image_url";
    const result = await fal.subscribe(modelConfig.endpoint, {
      input: {
        [imageKey]: body.imageUrl,
        prompt: body.prompt,
      },
      logs: true,
    });

    const data = result.data as {
      video: { url: string };
    };

    // Upload video to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(data.video.url, {
      resourceType: "video",
    });

    // Resolve session
    let sessionId = body.sessionId;
    if (!sessionId) {
      const [newSession] = await db
        .insert(sessions)
        .values({
          name: `Session ${new Date().toLocaleDateString()}`,
        })
        .returning({ id: sessions.id });
      sessionId = newSession.id;
    }

    // Save generation record
    await db
      .insert(generations)
      .values({
        sessionId,
        type: "video",
        cloudinaryUrl: cloudinaryResult.url,
        cloudinaryPublicId: cloudinaryResult.publicId,
        originalUrl: data.video.url,
        model: body.model,
        prompt: body.prompt,
        options: body as unknown as Record<string, unknown>,
      });

    return NextResponse.json({
      video: { url: cloudinaryResult.url },
      sessionId,
    });
  } catch (error) {
    console.error("Video generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
