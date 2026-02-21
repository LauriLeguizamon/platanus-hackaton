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
  ImageType,
  OccasionType,
  BrandConfig,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const VARIANT_SYSTEM_PROMPT = `You are a creative director for product photography. Your job is to generate distinct, creative prompt variations for AI image generation of the same product.

Each variation must represent a DIFFERENT creative approach — a unique scene, setting, mood, lighting style, or situational context. Avoid repetition between variations.

Rules:
- Each prompt must be a single paragraph, 2-4 sentences.
- Each prompt must instruct the AI to keep the product as the central focus, preserving its exact appearance, colors, and details from the reference image.
- Each prompt must be a complete, self-contained image generation prompt (not a fragment).
- Do NOT number the prompts or add labels — just output one prompt per line, separated by newlines.
- Do NOT include empty lines between prompts.
- Output ONLY the prompts, nothing else.`;

function buildVariantUserPrompt(
  numVariants: number,
  imageType: ImageType,
  discountText?: string,
  occasion?: OccasionType,
  brand?: BrandConfig,
  generationMode?: string,
  productCount?: number,
  additionalDetails?: string
): string {
  const parts: string[] = [];
  parts.push(
    `Generate exactly ${numVariants} creative prompt variations for product photography.`
  );

  if (imageType === "in-use") {
    parts.push(
      "Show the product being used in a realistic lifestyle context by a person or in a natural setting."
    );
  } else {
    parts.push(
      "Show the product alone as the sole focus, no people, clean and isolated with emphasis on the product."
    );
  }

  if (occasion) {
    parts.push(
      `The photos are themed for: ${occasion.replace(/-/g, " ")}.`
    );
  }

  if (discountText) {
    parts.push(
      `Include bold "${discountText}" text overlay in the design.`
    );
  }

  if (brand) {
    const brandParts: string[] = [];
    if (brand.brandName) brandParts.push(`Brand: ${brand.brandName}`);
    if (brand.tagline) brandParts.push(`Tagline: ${brand.tagline}`);
    if (brand.colors.primary)
      brandParts.push(`Primary color: ${brand.colors.primary}`);
    if (brand.colors.secondary)
      brandParts.push(`Secondary color: ${brand.colors.secondary}`);
    if (brand.colors.accent)
      brandParts.push(`Accent color: ${brand.colors.accent}`);
    if (brand.style) brandParts.push(`Style: ${brand.style}`);
    if (brandParts.length > 0) {
      parts.push(`Brand context: ${brandParts.join(", ")}.`);
    }
  }

  if (generationMode === "combine" && productCount && productCount > 1) {
    parts.push(
      `This is a multi-product composition with ${productCount} products that should appear together.`
    );
  }

  if (additionalDetails?.trim()) {
    parts.push(
      `Additional context from the user that MUST be incorporated into every variation: ${additionalDetails.trim()}`
    );
  }

  parts.push(
    "Each variation should be dramatically different in creative approach — vary the scene, lighting, background, mood, and composition style."
  );

  return parts.join("\n");
}

async function generateVariantPrompts(
  numVariants: number,
  imageType: ImageType,
  discountText?: string,
  occasion?: OccasionType,
  brand?: BrandConfig,
  generationMode?: string,
  productCount?: number,
  additionalDetails?: string
): Promise<string[]> {
  const userPrompt = buildVariantUserPrompt(
    numVariants,
    imageType,
    discountText,
    occasion,
    brand,
    generationMode,
    productCount,
    additionalDetails
  );

  const llmResult = await fal.subscribe("openrouter/router", {
    input: {
      model: "openai/gpt-4o-mini",
      system_prompt: VARIANT_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 1.0,
      max_tokens: 1500,
    },
  });

  const output = (llmResult.data as { output: string }).output;
  const prompts = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 20);

  // If we got enough, truncate to exact count
  if (prompts.length >= numVariants) {
    return prompts.slice(0, numVariants);
  }

  // Fallback: pad with the standard prompt if LLM returned too few
  const fallback = buildPrompt(imageType, discountText, occasion, brand, additionalDetails);
  while (prompts.length < numVariants) {
    prompts.push(fallback);
  }
  return prompts;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
  try {
    const formData = await request.formData();
    const optionsRaw = formData.get("options") as string | null;

    const multiFiles = formData.getAll("images") as File[];
    const singleFile = formData.get("image") as File | null;
    const allFiles =
      multiFiles.length > 0 ? multiFiles : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
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

    // Upload all images to FAL storage in parallel
    const imageUrls = await Promise.all(
      allFiles.map((file) => fal.storage.upload(file))
    );

    const modelConfig = MODEL_OPTIONS.find((m) => m.value === options.model);
    if (!modelConfig) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const aspectRatio = options.aspectRatio || "1:1";
    const mode = options.generationMode || "single";

    // Generate N distinct prompt variations using LLM
    const variantPrompts = await generateVariantPrompts(
      numImages,
      options.imageType,
      options.discountText,
      options.occasion,
      options.brand,
      mode,
      allFiles.length,
      options.additionalDetails
    );

    // Make N parallel FAL calls, one per prompt variation (each requesting 1 image)
    const falCalls = variantPrompts.map((prompt) => {
      const input = buildFalInput(modelConfig, imageUrls, prompt, 1, aspectRatio);
      return fal.subscribe(modelConfig.endpoint, { input, logs: true });
    });

    const settledResults = await Promise.allSettled(falCalls);

    const allImages: Array<{ url: string; width: number; height: number; prompt: string }> = [];
    const errors: string[] = [];

    for (let i = 0; i < settledResults.length; i++) {
      const result = settledResults[i];
      if (result.status === "fulfilled") {
        const data = result.value.data as {
          images: Array<{ url: string; width: number; height: number }>;
        };
        for (const img of data.images) {
          allImages.push({ ...img, prompt: variantPrompts[i] });
        }
      } else {
        errors.push(
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown FAL error"
        );
      }
    }

    if (allImages.length === 0) {
      return NextResponse.json(
        { error: `All variant generations failed: ${errors.join("; ")}` },
        { status: 500 }
      );
    }

    // Upload to Cloudinary in parallel
    const cloudinaryResults = await Promise.all(
      allImages.map((img) => uploadToCloudinary(img.url))
    );

    // Resolve session
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
        allImages.map((img, i) => ({
          sessionId: sessionId!,
          type: "image" as const,
          cloudinaryUrl: cloudinaryResults[i].url,
          cloudinaryPublicId: cloudinaryResults[i].publicId,
          originalUrl: img.url,
          width: img.width,
          height: img.height,
          model: options.model,
          prompt: img.prompt,
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
        width: gen.width ?? allImages[i].width,
        height: gen.height ?? allImages[i].height,
        prompt: gen.prompt ?? allImages[i].prompt,
      })),
    });
  } catch (error) {
    console.error("Variant generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
