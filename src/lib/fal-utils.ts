import { ASPECT_RATIO_TO_IMAGE_SIZE } from "@/lib/constants";
import type { ModelConfig } from "@/lib/types";

export function buildFalInput(
  config: ModelConfig,
  imageUrls: string[],
  prompt: string,
  numImages: number,
  aspectRatio: string
): Record<string, unknown> {
  const input: Record<string, unknown> = { prompt };

  if (config.imageInput === "image_urls") {
    input.image_urls = imageUrls;
  } else {
    input.image_url = imageUrls[0];
  }

  if (config.sizing === "aspect_ratio") {
    input.aspect_ratio = aspectRatio;
  } else if (config.sizing === "image_size") {
    input.image_size = ASPECT_RATIO_TO_IMAGE_SIZE[aspectRatio] || "square";
  }

  if (config.supportsNumImages) {
    input.num_images = numImages;
  }

  if (config.supportsOutputFormat) {
    input.output_format = "png";
  }

  if (config.extraParams) {
    Object.assign(input, config.extraParams);
  }

  return input;
}
