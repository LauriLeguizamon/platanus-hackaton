export type OccasionType =
  | "christmas"
  | "black-friday"
  | "valentines-day"
  | "halloween"
  | "new-year"
  | "mothers-day"
  | "fathers-day"
  | "easter"
  | "summer-sale"
  | "back-to-school";

export type ImageType = "in-use" | "product-alone";

export type GenerationMode = "single" | "combine" | "banner";

export interface ProductMeta {
  name: string;
  price: string;
  discount?: string;
}

export type ModelType =
  | "nano-banana"
  | "nano-banana-pro"
  | "flux-2-pro-edit"
  | "flux-2-dev-edit"
  | "flux-kontext-pro"
  | "flux-kontext-dev"
  | "grok-imagine"
  | "recraft-v3"
  | "flux-dev-i2i";

export type ImageInputStyle = "image_urls" | "image_url";
export type SizingParam = "aspect_ratio" | "image_size" | "none";

export interface ModelConfig {
  value: ModelType;
  label: string;
  endpoint: string;
  imageInput: ImageInputStyle;
  sizing: SizingParam;
  supportsNumImages: boolean;
  supportsOutputFormat: boolean;
  extraParams?: Record<string, unknown>;
}

export type BrandStyle =
  | "minimalist"
  | "bold"
  | "elegant"
  | "playful"
  | "corporate"
  | "organic";

export interface BrandConfig {
  brandName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  style: BrandStyle;
  websiteUrl?: string;
}

export interface ScrapeResult {
  brandName: string;
  tagline: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoUrl?: string;
}

export interface GenerateRequest {
  occasion?: OccasionType;
  discountText?: string;
  imageType: ImageType;
  model: ModelType;
  numImages: number;
  aspectRatio?: string;
  brand?: BrandConfig;
  generationMode?: GenerationMode;
  products?: ProductMeta[];
  additionalDetails?: string;
  sessionId?: string;
}

export interface GeneratedImage {
  id?: string;
  url: string;
  originalUrl?: string;
  width: number;
  height: number;
  prompt?: string;
}

export interface GenerateResponse {
  images: GeneratedImage[];
  sessionId: string;
}

export interface GenerateErrorResponse {
  error: string;
}

export type VideoModelType =
  | "minimax-live"
  | "kling-standard"
  | "wan-v2"
  | "veo-2"
  | "veo-3"
  | "veo-3-1-fast"
  | "sora-2"
  | "kling-2-master"
  | "kling-2-1-pro"
  | "kling-2-5-turbo"
  | "kling-3-standard"
  | "kling-3-pro"
  | "kling-o3-standard"
  | "kling-o3-pro"
  | "hailuo-02"
  | "luma-ray-2"
  | "pixverse-v5"
  | "ltx-2-19b"
  | "wan-v2-2"
  | "grok-video"
  | "lucy-14b";

export interface GenerateVideoRequest {
  imageUrl: string;
  model: VideoModelType;
  prompt: string;
  sessionId?: string;
}

export interface GeneratedVideo {
  url: string;
}

export interface GenerateVideoResponse {
  video: GeneratedVideo;
  sessionId?: string;
}

export interface GenerateVideoErrorResponse {
  error: string;
}

export type VideoJobStatus = "generating" | "done" | "error";

export interface VideoJob {
  status: VideoJobStatus;
  video?: GeneratedVideo;
  error?: string;
}

export interface ScrapedProduct {
  name: string;
  imageUrl: string;
  price?: string;
  productUrl?: string;
}

export type SocialPlatform = "instagram" | "twitter" | "linkedin" | "tiktok";

export interface ScrapeProductsResult {
  products: ScrapedProduct[];
  storeName?: string;
  platform?: "shopify" | "woocommerce" | "tiendanube" | "generic";
}
