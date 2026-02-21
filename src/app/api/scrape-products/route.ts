import { NextRequest, NextResponse } from "next/server";
import { scrapeProducts } from "@/lib/scrape-products";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await scrapeProducts(url);

    if (result.products.length === 0) {
      return NextResponse.json(
        { error: "No products found on this page. Try a product listing or collection page." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out" },
        { status: 504 }
      );
    }
    console.error("Scrape products error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to scrape website" },
      { status: 500 }
    );
  }
}
