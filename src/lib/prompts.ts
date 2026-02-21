import type {
  OccasionType,
  ImageType,
  BrandConfig,
  ProductMeta,
} from "./types";

function getOccasionContext(occasion?: OccasionType): string {
  switch (occasion) {
    case "christmas":
      return "Create a festive Christmas-themed product photo with red and green color accents, pine branches, snowflakes, warm golden fairy lights, cozy holiday atmosphere";
    case "black-friday":
      return "Create a dramatic Black Friday sale product photo with a dark black background, bold gold and white accents, premium luxury feel, striking contrast, sleek modern aesthetic";
    case "valentines-day":
      return "Create a romantic Valentine's Day product photo with soft pink and red tones, rose petals scattered around, heart-shaped bokeh lights, warm romantic lighting";
    case "halloween":
      return "Create a Halloween-themed product photo with orange and purple accents, subtle spooky atmosphere, autumn leaves, candlelight, mysterious fog effect";
    case "new-year":
      return "Create a glamorous New Year celebration product photo with gold and silver confetti, champagne sparkles, midnight blue tones, festive party atmosphere";
    case "mothers-day":
      return "Create a warm Mother's Day themed product photo with soft pastel flowers, gentle natural lighting, elegant floral arrangement, spring garden vibes";
    case "fathers-day":
      return "Create a sophisticated Father's Day themed product photo with masculine earthy tones, wood and leather textures, warm amber lighting, refined classic aesthetic";
    case "easter":
      return "Create a cheerful Easter-themed product photo with pastel colors, spring flowers, decorative eggs, fresh and bright natural lighting";
    case "summer-sale":
      return "Create a vibrant summer sale product photo with tropical colors, bright sunshine lighting, beach or poolside vibes, refreshing energetic atmosphere";
    case "back-to-school":
      return "Create a back-to-school themed product photo with notebooks, pencils, school supplies as props, bright organized desktop setting, fresh start vibes";
    default:
      return "Create a seasonal celebration product photo with festive decorations and warm inviting lighting";
  }
}

function getDiscountContext(discountText?: string): string {
  return `Create an eye-catching promotional sale image for this product with bold "${discountText || "SALE"}" text overlay, vibrant accent colors, urgency-inducing design, retail promotional photography style`;
}

function getImageTypeContext(imageType: ImageType): string {
  if (imageType === "in-use") {
    return "Show the product being actively used in a realistic lifestyle context by a person or in a natural setting";
  }
  return "Show the product alone as the sole focus, no people, clean and isolated with emphasis entirely on the product itself";
}

export function buildVideoPrompt(): string {
  return "Slowly animate this product photo with a gentle, professional camera movement. Subtle zoom and soft lighting shifts to create an engaging product showcase video. Keep the product as the central focus with smooth, elegant motion.";
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  minimalist:
    "Use a clean, minimalist aesthetic with ample negative space and subtle tones",
  bold: "Use bold, high-contrast visuals with strong graphic elements",
  elegant:
    "Use an elegant, luxurious aesthetic with refined textures and soft lighting",
  playful:
    "Use a fun, playful aesthetic with vibrant energy and dynamic composition",
  corporate:
    "Use a polished, professional corporate aesthetic with clean lines",
  organic:
    "Use a natural, organic aesthetic with earthy textures and warm tones",
};

function getBrandContext(brand?: BrandConfig): string {
  if (!brand) return "";

  const parts: string[] = [];

  if (brand.brandName) {
    parts.push(`This is a product photo for the brand "${brand.brandName}"`);
  }

  if (brand.tagline) {
    parts.push(`with the tagline "${brand.tagline.slice(0, 100)}"`);
  }

  const colorParts: string[] = [];
  if (brand.colors.primary)
    colorParts.push(`primary color ${brand.colors.primary}`);
  if (brand.colors.secondary)
    colorParts.push(`secondary color ${brand.colors.secondary}`);
  if (brand.colors.accent)
    colorParts.push(`accent color ${brand.colors.accent}`);
  if (colorParts.length > 0) {
    parts.push(
      `Incorporate the brand's color palette into the background, lighting, and styling: ${colorParts.join(", ")}`,
    );
  }

  if (brand.style && STYLE_DESCRIPTIONS[brand.style]) {
    parts.push(STYLE_DESCRIPTIONS[brand.style]);
  }

  return parts.join(". ") + ".";
}

export function buildPrompt(
  imageType: ImageType,
  discountText?: string,
  occasion?: OccasionType,
  brand?: BrandConfig,
  additionalDetails?: string,
): string {
  const parts: string[] = [];

  if (discountText && occasion) {
    parts.push(getDiscountContext(discountText));
    parts.push(getOccasionContext(occasion));
  } else if (discountText) {
    parts.push(getDiscountContext(discountText));
  } else if (occasion) {
    parts.push(getOccasionContext(occasion));
  } else {
    parts.push(
      "Create a professional product photograph with clean, studio-quality lighting",
    );
  }

  parts.push(getImageTypeContext(imageType));

  const brandContext = getBrandContext(brand);
  if (brandContext) {
    parts.push(brandContext);
  }

  if (additionalDetails?.trim()) {
    parts.push(additionalDetails.trim());
  }

  parts.push(
    "Ensure the product from the reference image is the central focus, maintaining its exact appearance, colors, and details. Professional photography quality, sharp focus on the product.",
  );

  return parts.join(". ");
}

export function buildCombinePrompt(
  imageType: ImageType,
  productCount: number,
  discountText?: string,
  occasion?: OccasionType,
  brand?: BrandConfig,
  additionalDetails?: string,
): string {
  const parts: string[] = [];

  if (occasion) {
    parts.push(getOccasionContext(occasion));
  } else {
    parts.push(
      "Create a professional product photograph with clean, studio-quality lighting",
    );
  }

  parts.push(
    `Create a cohesive product photography scene featuring all ${productCount} products from the reference images together in the same composition. Arrange the products in a visually balanced, harmonious layout where each product is clearly visible and maintains its exact appearance, colors, and details`,
  );

  if (discountText) {
    parts.push(
      `Include bold "${discountText}" text overlay with vibrant accent colors`,
    );
  }

  parts.push(getImageTypeContext(imageType));

  const brandContext = getBrandContext(brand);
  if (brandContext) {
    parts.push(brandContext);
  }

  if (additionalDetails?.trim()) {
    parts.push(additionalDetails.trim());
  }

  parts.push(
    "The products should look like they naturally belong together in the same scene. Professional photography quality, sharp focus on all products.",
  );

  return parts.join(". ");
}

export function buildBannerPrompt(
  products: ProductMeta[],
  occasion?: OccasionType,
  brand?: BrandConfig,
  additionalDetails?: string,
): string {
  const parts: string[] = [];

  if (occasion) {
    parts.push(getOccasionContext(occasion));
  } else {
    parts.push("Create a professional, modern promotional banner");
  }

  const productDescriptions = products
    .map((p, i) => {
      let desc = `Product ${i + 1}: "${p.name}" priced at ${p.price}`;
      if (p.discount) {
        desc += ` (discounted to ${p.discount})`;
      }
      return desc;
    })
    .join(". ");

  parts.push(
    `Design a wide promotional marketing banner featuring the following products from the reference images: ${productDescriptions}. Each product should be displayed separately in its own section of the banner with its price clearly shown`,
  );

  if (products.some((p) => p.discount)) {
    parts.push(
      "Highlight discounted prices with bold, eye-catching styling (e.g., strikethrough on original price, bold discount price)",
    );
  }

  const brandContext = getBrandContext(brand);
  if (brandContext) {
    parts.push(brandContext);
  }

  if (additionalDetails?.trim()) {
    parts.push(additionalDetails.trim());
  }

  return parts.join(". ");
}
