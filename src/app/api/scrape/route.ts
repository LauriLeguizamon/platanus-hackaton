import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import type { ScrapeResult } from "@/lib/types";

function isValidHex(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s.trim());
}

function normalizeHex(hex: string): string {
  hex = hex.trim().toLowerCase();
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (hex.length === 9) {
    return hex.slice(0, 7);
  }
  return hex;
}

function extractColors($: cheerio.CheerioAPI, _html: string): string[] {
  const colors: string[] = [];

  const themeColor = $('meta[name="theme-color"]').attr("content");
  if (themeColor && isValidHex(themeColor)) {
    colors.push(normalizeHex(themeColor));
  }

  const tileColor = $('meta[name="msapplication-TileColor"]').attr("content");
  if (tileColor && isValidHex(tileColor)) {
    colors.push(normalizeHex(tileColor));
  }

  const styleText =
    $("style").text() +
    " " +
    $("[style]")
      .map((_, el) => $(el).attr("style"))
      .get()
      .join(" ");

  const hexRegex = /#([0-9a-fA-F]{3,8})\b/g;
  let match;
  const hexCounts = new Map<string, number>();

  while ((match = hexRegex.exec(styleText)) !== null) {
    const hex = normalizeHex(match[0]);
    if (
      hex === "#ffffff" ||
      hex === "#000000" ||
      hex === "#fff" ||
      hex === "#000"
    )
      continue;
    hexCounts.set(hex, (hexCounts.get(hex) || 0) + 1);
  }

  const sorted = [...hexCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [hex] of sorted) {
    if (colors.length >= 3) break;
    if (!colors.includes(hex)) {
      colors.push(hex);
    }
  }

  return colors;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProductPhotoStudio/1.0)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const brandName =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content") ||
      $("title").text().split(/[|\-–]/).pop()?.trim() ||
      parsedUrl.hostname.replace("www.", "").split(".")[0];

    const tagline =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      "";

    const colors = extractColors($, html);

    const logoHref =
      $('link[rel="icon"][type="image/svg+xml"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('meta[property="og:image"]').attr("content") ||
      undefined;

    const result: ScrapeResult = {
      brandName: brandName || "",
      tagline: (tagline || "").slice(0, 200),
      colors: {
        primary: colors[0] || "#000000",
        secondary: colors[1] || "#ffffff",
        accent: colors[2] || "#666666",
      },
      logoUrl: logoHref
        ? new URL(logoHref, parsedUrl).toString()
        : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out" },
        { status: 504 }
      );
    }
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "Failed to scrape website" },
      { status: 500 }
    );
  }
}
