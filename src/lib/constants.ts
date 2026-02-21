import type { OccasionType, VideoModelType, ModelConfig, ModelType, BrandStyle, GenerationMode, SocialPlatform } from "./types";

export const OCCASION_OPTIONS: { value: OccasionType; label: string }[] = [
  { value: "christmas", label: "Christmas" },
  { value: "black-friday", label: "Black Friday" },
  { value: "valentines-day", label: "Valentine's Day" },
  { value: "halloween", label: "Halloween" },
  { value: "new-year", label: "New Year" },
  { value: "mothers-day", label: "Mother's Day" },
  { value: "fathers-day", label: "Father's Day" },
  { value: "easter", label: "Easter" },
  { value: "summer-sale", label: "Summer Sale" },
  { value: "back-to-school", label: "Back to School" },
];

export const ASPECT_RATIO_TO_IMAGE_SIZE: Record<string, string> = {
  "1:1": "square",
  "4:3": "landscape_4_3",
  "3:4": "portrait_4_3",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
};

export const MODEL_OPTIONS: ModelConfig[] = [
  {
    value: "nano-banana",
    label: "Nano Banana",
    endpoint: "fal-ai/nano-banana/edit",
    imageInput: "image_urls",
    sizing: "aspect_ratio",
    supportsNumImages: true,
    supportsOutputFormat: true,
  },
  {
    value: "nano-banana-pro",
    label: "Nano Banana Pro",
    endpoint: "fal-ai/nano-banana-pro/edit",
    imageInput: "image_urls",
    sizing: "aspect_ratio",
    supportsNumImages: true,
    supportsOutputFormat: true,
  },
  {
    value: "flux-2-pro-edit",
    label: "FLUX.2 Pro Edit",
    endpoint: "fal-ai/flux-2-pro/edit",
    imageInput: "image_urls",
    sizing: "image_size",
    supportsNumImages: false,
    supportsOutputFormat: true,
  },
  {
    value: "flux-2-dev-edit",
    label: "FLUX.2 Dev Edit",
    endpoint: "fal-ai/flux-2/edit",
    imageInput: "image_urls",
    sizing: "image_size",
    supportsNumImages: true,
    supportsOutputFormat: true,
  },
  {
    value: "flux-kontext-pro",
    label: "FLUX.1 Kontext Pro",
    endpoint: "fal-ai/flux-pro/kontext",
    imageInput: "image_url",
    sizing: "none",
    supportsNumImages: false,
    supportsOutputFormat: false,
  },
  {
    value: "flux-kontext-dev",
    label: "FLUX.1 Kontext Dev",
    endpoint: "fal-ai/flux-kontext/dev",
    imageInput: "image_url",
    sizing: "none",
    supportsNumImages: true,
    supportsOutputFormat: true,
  },
  {
    value: "grok-imagine",
    label: "Grok Imagine Image",
    endpoint: "xai/grok-imagine-image/edit",
    imageInput: "image_url",
    sizing: "none",
    supportsNumImages: true,
    supportsOutputFormat: true,
  },
  {
    value: "recraft-v3",
    label: "Recraft V3",
    endpoint: "fal-ai/recraft/v3/image-to-image",
    imageInput: "image_url",
    sizing: "none",
    supportsNumImages: false,
    supportsOutputFormat: false,
    extraParams: { strength: 0.75 },
  },
  {
    value: "flux-dev-i2i",
    label: "FLUX.1 Dev Image-to-Image",
    endpoint: "fal-ai/flux/dev/image-to-image",
    imageInput: "image_url",
    sizing: "none",
    supportsNumImages: true,
    supportsOutputFormat: true,
    extraParams: { strength: 0.85 },
  },
];

export const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "16:9", label: "Wide (16:9)" },
  { value: "9:16", label: "Tall (9:16)" },
];

export const MAX_IMAGES = 4;
export const DEFAULT_NUM_IMAGES = 1;
export const DEFAULT_MODEL: ModelType = "nano-banana";
export const DEFAULT_ASPECT_RATIO = "1:1";

export const VIDEO_MODEL_OPTIONS: {
  value: VideoModelType;
  label: string;
  endpoint: string;
  imageInputKey?: string;
}[] = [
  {
    value: "veo-3-1-fast",
    label: "Google Veo 3.1 Fast",
    endpoint: "fal-ai/veo3.1/fast/image-to-video",
  },
  {
    value: "veo-3",
    label: "Google Veo 3",
    endpoint: "fal-ai/veo3/image-to-video",
  },
  {
    value: "veo-2",
    label: "Google Veo 2",
    endpoint: "fal-ai/veo2/image-to-video",
  },
  {
    value: "sora-2",
    label: "OpenAI Sora 2",
    endpoint: "fal-ai/sora-2/image-to-video",
  },
  {
    value: "kling-o3-pro",
    label: "Kling O3 Pro",
    endpoint: "fal-ai/kling-video/o3/pro/image-to-video",
    imageInputKey: "start_image_url",
  },
  {
    value: "kling-o3-standard",
    label: "Kling O3 Standard",
    endpoint: "fal-ai/kling-video/o3/standard/image-to-video",
    imageInputKey: "start_image_url",
  },
  {
    value: "kling-3-pro",
    label: "Kling 3.0 Pro",
    endpoint: "fal-ai/kling-video/v3/pro/image-to-video",
    imageInputKey: "start_image_url",
  },
  {
    value: "kling-3-standard",
    label: "Kling 3.0 Standard",
    endpoint: "fal-ai/kling-video/v3/standard/image-to-video",
    imageInputKey: "start_image_url",
  },
  {
    value: "kling-2-5-turbo",
    label: "Kling 2.5 Turbo Pro",
    endpoint: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
  },
  {
    value: "kling-2-1-pro",
    label: "Kling 2.1 Pro",
    endpoint: "fal-ai/kling-video/v2.1/pro/image-to-video",
  },
  {
    value: "kling-2-master",
    label: "Kling 2.0 Master",
    endpoint: "fal-ai/kling-video/v2/master/image-to-video",
  },
  {
    value: "kling-standard",
    label: "Kling Video v1 Standard",
    endpoint: "fal-ai/kling-video/v1/standard/image-to-video",
  },
  {
    value: "minimax-live",
    label: "MiniMax Video-01 Live",
    endpoint: "fal-ai/minimax/video-01-live/image-to-video",
  },
  {
    value: "hailuo-02",
    label: "MiniMax Hailuo-02",
    endpoint: "fal-ai/minimax/hailuo-02/standard/image-to-video",
  },
  {
    value: "luma-ray-2",
    label: "Luma Ray 2",
    endpoint: "fal-ai/luma-dream-machine/ray-2/image-to-video",
  },
  {
    value: "pixverse-v5",
    label: "PixVerse v5",
    endpoint: "fal-ai/pixverse/v5/image-to-video",
  },
  {
    value: "grok-video",
    label: "Grok Imagine Video",
    endpoint: "xai/grok-imagine-video/image-to-video",
  },
  {
    value: "wan-v2-2",
    label: "Wan 2.2",
    endpoint: "fal-ai/wan/v2.2-a14b/image-to-video",
  },
  {
    value: "wan-v2",
    label: "Wan v2.1",
    endpoint: "fal-ai/wan/v2.1/image-to-video",
  },
  {
    value: "ltx-2-19b",
    label: "LTX-2 19B",
    endpoint: "fal-ai/ltx-2-19b/image-to-video",
  },
  {
    value: "lucy-14b",
    label: "Lucy 14B",
    endpoint: "decart/lucy-14b/image-to-video",
  },
];

export const DEFAULT_VIDEO_MODEL: VideoModelType = "minimax-live";

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_SCRAPED_PRODUCTS = 30;
export const PRODUCTS_PER_PAGE = 10;
export const MAX_SELECTED_PRODUCTS = 5;

export const GENERATION_MODE_OPTIONS: { value: GenerationMode; label: string; description: string }[] = [
  {
    value: "combine",
    label: "Combine",
    description: "All products styled together in one scene",
  },
  {
    value: "banner",
    label: "Banner",
    description: "Marketing banner with prices for each product",
  },
];

export const SOCIAL_PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
];

export const BRAND_STYLE_OPTIONS: { value: BrandStyle; label: string }[] = [
  { value: "minimalist", label: "Minimalist" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
  { value: "playful", label: "Playful" },
  { value: "corporate", label: "Corporate" },
  { value: "organic", label: "Organic" },
];
