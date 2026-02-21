import * as cheerio from "cheerio";
import type { ScrapedProduct, ScrapeProductsResult } from "./types";
import { MAX_SCRAPED_PRODUCTS } from "./constants";

type Platform = ScrapeProductsResult["platform"];

export function detectPlatform(
  $: cheerio.CheerioAPI,
  html: string,
  url: URL
): Platform {
  if (
    html.includes("cdn.shopify.com") ||
    html.includes("Shopify.theme") ||
    url.hostname.includes("myshopify.com")
  ) {
    return "shopify";
  }

  if (
    html.includes("tiendanube") ||
    html.includes("nuvemshop") ||
    url.hostname.includes("mitienda.") ||
    url.hostname.includes("tiendanube.com")
  ) {
    return "tiendanube";
  }

  if (
    html.includes("woocommerce") ||
    $(".woocommerce").length > 0 ||
    $('[class*="wc-block"]').length > 0
  ) {
    return "woocommerce";
  }

  return "generic";
}

export function extractStoreName(
  $: cheerio.CheerioAPI,
  url: URL
): string | undefined {
  return (
    $('meta[property="og:site_name"]').attr("content") ||
    $('meta[name="application-name"]').attr("content") ||
    $("title").text().split(/[|\-–]/)[0]?.trim() ||
    url.hostname.replace("www.", "").split(".")[0]
  );
}

export async function extractFromShopifyApi(
  baseUrl: URL
): Promise<ScrapedProduct[] | null> {
  try {
    const apiUrl = `${baseUrl.origin}/products.json?limit=${MAX_SCRAPED_PRODUCTS}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProductPhotoStudio/1.0)",
        Accept: "application/json",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.products || !Array.isArray(data.products)) return null;

    return data.products
      .slice(0, MAX_SCRAPED_PRODUCTS)
      .map(
        (p: {
          title?: string;
          images?: { src?: string }[];
          variants?: { price?: string }[];
          handle?: string;
        }) => ({
          name: p.title || "Unknown Product",
          imageUrl: p.images?.[0]?.src || "",
          price: p.variants?.[0]?.price
            ? `$${p.variants[0].price}`
            : undefined,
          productUrl: p.handle
            ? `${baseUrl.origin}/products/${p.handle}`
            : undefined,
        })
      )
      .filter((p: ScrapedProduct) => p.imageUrl);
  } catch {
    return null;
  }
}

export function extractFromJsonLd(
  $: cheerio.CheerioAPI,
  baseUrl: URL
): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).text());
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        // Direct Product type
        if (item["@type"] === "Product") {
          addProductFromJsonLd(item, products, baseUrl);
        }

        // ItemList containing products
        if (
          item["@type"] === "ItemList" &&
          Array.isArray(item.itemListElement)
        ) {
          for (const listItem of item.itemListElement) {
            const product = listItem.item || listItem;
            if (product["@type"] === "Product") {
              addProductFromJsonLd(product, products, baseUrl);
            }
          }
        }

        // @graph array
        if (Array.isArray(item["@graph"])) {
          for (const graphItem of item["@graph"]) {
            if (graphItem["@type"] === "Product") {
              addProductFromJsonLd(graphItem, products, baseUrl);
            }
          }
        }
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  return products;
}

function addProductFromJsonLd(
  item: Record<string, unknown>,
  products: ScrapedProduct[],
  baseUrl: URL
) {
  const imageRaw = item.image;
  let imageUrl = "";
  if (typeof imageRaw === "string") {
    imageUrl = imageRaw;
  } else if (Array.isArray(imageRaw) && typeof imageRaw[0] === "string") {
    imageUrl = imageRaw[0];
  } else if (
    typeof imageRaw === "object" &&
    imageRaw !== null &&
    "url" in imageRaw
  ) {
    imageUrl = String((imageRaw as { url: string }).url);
  }

  if (!imageUrl) return;

  try {
    imageUrl = new URL(imageUrl, baseUrl).toString();
  } catch {
    return;
  }

  let price: string | undefined;
  const offers = item.offers as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | undefined;
  if (offers) {
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer?.price) {
      const currency = (offer.priceCurrency as string) || "$";
      price = `${currency} ${offer.price}`;
    }
  }

  let productUrl: string | undefined;
  if (typeof item.url === "string") {
    try {
      productUrl = new URL(item.url, baseUrl).toString();
    } catch {
      // skip
    }
  }

  products.push({
    name: String(item.name || "Unknown Product"),
    imageUrl,
    price,
    productUrl,
  });
}

export function extractFromSelectors(
  $: cheerio.CheerioAPI,
  baseUrl: URL,
  platform: Platform
): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];

  const selectorSets: Record<
    string,
    {
      container: string;
      image: string;
      name: string;
      price: string;
      link: string;
    }
  > = {
    shopify: {
      container:
        ".product-card, .grid-product, .product-item, [data-product-id], .grid__item .grid-product__content, .product-grid-item",
      image: "img",
      name: ".product-card__title, .product-card__name, h2 a, h3 a, .grid-product__title, .product-grid-item__title",
      price: ".product-price, .money, [data-product-price], .price, .grid-product__price",
      link: 'a[href*="/products/"]',
    },
    tiendanube: {
      container:
        ".js-item-product, .item-product, .product-block, .js-product-container",
      image: ".item-image img, .product-image img, img",
      name: ".item-name, .item-title, .js-item-name, h2 a, h3 a",
      price: ".item-price, .js-price-display, .price",
      link: "a[href]",
    },
    woocommerce: {
      container:
        "li.product, .wc-block-grid__product, .product-item, .product",
      image:
        ".woocommerce-LoopProduct-link img, .attachment-woocommerce_thumbnail, img",
      name: ".woocommerce-loop-product__title, h2.wc-block-grid__product-title, h2 a, .product-title",
      price: ".price, .woocommerce-Price-amount",
      link: ".woocommerce-LoopProduct-link, a[href]",
    },
  };

  const selectors = platform ? selectorSets[platform] : undefined;
  if (!selectors) return products;

  $(selectors.container).each((_, el) => {
    if (products.length >= MAX_SCRAPED_PRODUCTS) return false;

    const $el = $(el);

    // Extract image
    const $img = $el.find(selectors.image).first();
    let imageUrl =
      $img.attr("src") ||
      $img.attr("data-src") ||
      $img.attr("data-srcset")?.split(",")[0]?.trim().split(" ")[0] ||
      $img.attr("data-original");

    if (!imageUrl) return;

    try {
      imageUrl = new URL(imageUrl, baseUrl).toString();
    } catch {
      return;
    }

    // Skip tiny/placeholder images
    if (imageUrl.includes("placeholder") || imageUrl.includes("1x1")) return;

    // Extract name
    const $name = $el.find(selectors.name).first();
    const name =
      $name.text().trim() || $img.attr("alt")?.trim() || "Unknown Product";

    // Extract price
    const $price = $el.find(selectors.price).first();
    const price = $price.text().trim() || undefined;

    // Extract link
    const $link = $el.find(selectors.link).first();
    let productUrl: string | undefined;
    const href = $link.attr("href");
    if (href) {
      try {
        productUrl = new URL(href, baseUrl).toString();
      } catch {
        // skip
      }
    }

    products.push({ name, imageUrl, price, productUrl });
  });

  return products;
}

export function extractGeneric(
  $: cheerio.CheerioAPI,
  baseUrl: URL
): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  const priceRegex = /[\$\€\£]\s*\d+[.,]?\d*|\d+[.,]?\d*\s*[\$\€\£ARS]/;

  $(
    '[class*="product"], [class*="item"], [data-product], [class*="card"]'
  ).each((_, el) => {
    if (products.length >= MAX_SCRAPED_PRODUCTS) return false;

    const $el = $(el);

    // Skip nav, header, footer elements
    if ($el.closest("nav, header, footer").length > 0) return;

    // Must have an image
    const $img = $el.find("img").first();
    let imageUrl = $img.attr("src") || $img.attr("data-src");
    if (!imageUrl) return;

    try {
      imageUrl = new URL(imageUrl, baseUrl).toString();
    } catch {
      return;
    }

    // Skip tiny images (likely icons)
    const width = parseInt($img.attr("width") || "0", 10);
    if (width > 0 && width < 50) return;
    if (imageUrl.includes("placeholder") || imageUrl.includes("1x1")) return;

    // Must have a name (from heading or link text)
    const $heading = $el.find("h2, h3, h4, a").first();
    const name =
      $heading.text().trim() || $img.attr("alt")?.trim() || "";
    if (!name || name.length < 2) return;

    // Optional price
    const text = $el.text();
    const priceMatch = text.match(priceRegex);
    const price = priceMatch ? priceMatch[0].trim() : undefined;

    // Link
    const $link = $el.find("a").first();
    let productUrl: string | undefined;
    const href = $link.attr("href");
    if (href) {
      try {
        productUrl = new URL(href, baseUrl).toString();
      } catch {
        // skip
      }
    }

    products.push({ name, imageUrl, price, productUrl });
  });

  return products;
}

export function deduplicateProducts(
  products: ScrapedProduct[]
): ScrapedProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.imageUrl;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function scrapeProducts(
  url: string
): Promise<ScrapeProductsResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    throw new Error("Invalid URL");
  }

  // Try Shopify API first (fast path)
  if (
    parsedUrl.hostname.includes("myshopify.com") ||
    parsedUrl.hostname.includes("shopify")
  ) {
    const shopifyProducts = await extractFromShopifyApi(parsedUrl);
    if (shopifyProducts && shopifyProducts.length > 0) {
      return {
        products: deduplicateProducts(shopifyProducts).slice(
          0,
          MAX_SCRAPED_PRODUCTS
        ),
        storeName: parsedUrl.hostname.replace("www.", "").split(".")[0],
        platform: "shopify",
      };
    }
  }

  // Fetch HTML
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(parsedUrl.toString(), {
    signal: controller.signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  clearTimeout(timeout);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const platform = detectPlatform($, html, parsedUrl);
  const storeName = extractStoreName($, parsedUrl);

  // Try Shopify API if platform detected as shopify
  if (platform === "shopify") {
    const shopifyProducts = await extractFromShopifyApi(parsedUrl);
    if (shopifyProducts && shopifyProducts.length > 0) {
      return {
        products: deduplicateProducts(shopifyProducts).slice(
          0,
          MAX_SCRAPED_PRODUCTS
        ),
        storeName,
        platform,
      };
    }
  }

  // Collect from all strategies
  let products: ScrapedProduct[] = [];

  // JSON-LD
  const jsonLdProducts = extractFromJsonLd($, parsedUrl);
  products.push(...jsonLdProducts);

  // Platform selectors
  if (platform !== "generic") {
    const selectorProducts = extractFromSelectors($, parsedUrl, platform);
    products.push(...selectorProducts);
  }

  // Generic fallback if not enough products
  if (products.length < 5) {
    const genericProducts = extractGeneric($, parsedUrl);
    products.push(...genericProducts);
  }

  products = deduplicateProducts(products).slice(0, MAX_SCRAPED_PRODUCTS);

  return { products, storeName, platform };
}
