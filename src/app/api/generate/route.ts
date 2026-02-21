import { fal } from "@fal-ai/client";
import { buildPrompt, buildCombinePrompt, buildBannerPrompt } from "@/lib/prompts";
import { MODEL_OPTIONS, MAX_IMAGES } from "@/lib/constants";
import { buildFalInput } from "@/lib/fal-utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/db";
import { sessions, generations } from "@/db/schema";
import type {
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
  try {
    const formData = await request.formData();
    const optionsRaw = formData.get("options") as string | null;

    // Support both single "image" and multiple "images"
    const multiFiles = formData.getAll("images") as File[];
    const singleFile = formData.get("image") as File | null;
    const allFiles = multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!optionsRaw) {
      return NextResponse.json(
        { error: "No options provided" },
        { status: 400 }
      );
    }

    let options: GenerateRequest;
    try {
      options = JSON.parse(optionsRaw);
    } catch {
      return NextResponse.json(
        { error: "Invalid options format" },
        { status: 400 }
      );
    }

    if (!options.imageType || !options.model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const numImages = Math.min(Math.max(options.numImages || 1, 1), MAX_IMAGES);

    // Upload all images in parallel
    const imageUrls = await Promise.all(
      allFiles.map((file) => fal.storage.upload(file))
    );

    // Build prompt based on generation mode
    const mode = options.generationMode || "single";
    let prompt: string;
    let aspectRatio = options.aspectRatio || "1:1";

    switch (mode) {
      case "combine":
        prompt = buildCombinePrompt(
          options.imageType,
          allFiles.length,
          options.discountText,
          options.occasion,
          options.brand,
          options.additionalDetails
        );
        break;
      case "banner":
        prompt = buildBannerPrompt(
          options.products || [],
          options.occasion,
          options.brand,
          options.additionalDetails
        );
        // Default to wide aspect ratio for banners
        if (!options.aspectRatio) {
          aspectRatio = "16:9";
        }
        break;
      default:
        prompt = buildPrompt(
          options.imageType,
          options.discountText,
          options.occasion,
          options.brand,
          options.additionalDetails
        );
    }

    const modelConfig = MODEL_OPTIONS.find((m) => m.value === options.model);
    if (!modelConfig) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const input = buildFalInput(
      modelConfig,
      imageUrls,
      prompt,
      numImages,
      aspectRatio
    );

    const result = await fal.subscribe(modelConfig.endpoint, {
      input,
      logs: true,
    });

    const data = result.data as {
      images: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    };

    // Upload to Cloudinary in parallel
    const cloudinaryResults = await Promise.all(
      data.images.map((img) => uploadToCloudinary(img.url))
    );

    // Resolve session: use provided sessionId or create a new one
    let sessionId = options.sessionId;
    if (!sessionId) {
      const [newSession] = await db
        .insert(sessions)
        .values({
          name: `Session ${new Date().toLocaleDateString()}`,
          brandConfig: options.brand ?? null,
        })
        .returning({ id: sessions.id });
      sessionId = newSession.id;
    }

    // Insert generation records
    const generationRecords = await db
      .insert(generations)
      .values(
        data.images.map((img, i) => ({
          sessionId: sessionId!,
          type: "image" as const,
          cloudinaryUrl: cloudinaryResults[i].url,
          cloudinaryPublicId: cloudinaryResults[i].publicId,
          originalUrl: img.url,
          width: img.width,
          height: img.height,
          model: options.model,
          prompt,
          options: options as unknown as Record<string, unknown>,
        }))
      )
      .returning();

    return NextResponse.json({
      sessionId,
      images: generationRecords.map((gen, i) => ({
        id: gen.id,
        url: gen.cloudinaryUrl,
        originalUrl: gen.originalUrl,
        width: gen.width ?? data.images[i].width,
        height: gen.height ?? data.images[i].height,
      })),
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
