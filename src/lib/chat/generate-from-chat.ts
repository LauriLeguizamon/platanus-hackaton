import { fal } from "@fal-ai/client";
import { buildPrompt } from "@/lib/prompts";
import { MODEL_OPTIONS } from "@/lib/constants";
import { buildFalInput } from "@/lib/fal-utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/db";
import { sessions, generations } from "@/db/schema";
import type {
  BrandConfig,
  BrandStyle,
  ImageType,
  OccasionType,
} from "@/lib/types";

export interface ChatGenerateParams {
  imageUrls: string[];
  imageType: ImageType;
  occasion?: OccasionType;
  discountText?: string;
  brandName?: string;
  brandStyle?: BrandStyle;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  additionalDetails?: string;
  aspectRatio?: string;
  numImages?: number;
}

export async function generateFromChat(params: ChatGenerateParams) {
  const model = "nano-banana";
  const modelConfig = MODEL_OPTIONS.find((m) => m.value === model)!;
  const numImages = params.numImages ?? 1;
  const aspectRatio = params.aspectRatio ?? "1:1";

  // Build brand config if provided
  const brand: BrandConfig | undefined = params.brandName
    ? {
        brandName: params.brandName,
        tagline: "",
        colors: {
          primary: params.brandColors?.primary ?? "",
          secondary: params.brandColors?.secondary ?? "",
          accent: params.brandColors?.accent ?? "",
        },
        style: (params.brandStyle ?? "minimalist") as BrandStyle,
      }
    : undefined;

  const prompt = buildPrompt(
    params.imageType,
    params.discountText,
    params.occasion,
    brand,
    params.additionalDetails
  );

  // Upload all image URLs to FAL storage
  const falUrls = await Promise.all(
    params.imageUrls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "product.png", { type: blob.type });
      return fal.storage.upload(file);
    })
  );

  const input = buildFalInput(modelConfig, falUrls, prompt, numImages, aspectRatio);

  const result = await fal.subscribe(modelConfig.endpoint, { input, logs: true });
  const data = result.data as {
    images: Array<{ url: string; width: number; height: number }>;
  };

  // Upload to Cloudinary
  const cloudinaryResults = await Promise.all(
    data.images.map((img) => uploadToCloudinary(img.url))
  );

  // Create session
  const [newSession] = await db
    .insert(sessions)
    .values({
      name: `Chat Session ${new Date().toLocaleDateString()}`,
      brandConfig: brand ?? null,
    })
    .returning({ id: sessions.id });

  // Insert generation records
  await db.insert(generations).values(
    data.images.map((img, i) => ({
      sessionId: newSession.id,
      type: "image" as const,
      cloudinaryUrl: cloudinaryResults[i].url,
      cloudinaryPublicId: cloudinaryResults[i].publicId,
      originalUrl: img.url,
      width: img.width,
      height: img.height,
      model,
      prompt,
      options: params as unknown as Record<string, unknown>,
    }))
  );

  return {
    success: true,
    images: data.images.map((img, i) => ({
      url: cloudinaryResults[i].url,
      width: img.width,
      height: img.height,
    })),
    sessionId: newSession.id,
    prompt,
  };
}
