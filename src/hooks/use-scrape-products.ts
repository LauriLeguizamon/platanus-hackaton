"use client";

import { useState, useCallback } from "react";
import type { ScrapedProduct, ScrapeProductsResult } from "@/lib/types";

type ScrapeStatus = "idle" | "loading" | "success" | "error";

interface ScrapeState {
  status: ScrapeStatus;
  products: ScrapedProduct[];
  storeName?: string;
  platform?: string;
  error?: string;
}

export function useScrapeProducts() {
  const [state, setState] = useState<ScrapeState>({
    status: "idle",
    products: [],
  });

  const scrape = useCallback(async (url: string) => {
    setState({ status: "loading", products: [] });
    try {
      const res = await fetch("/api/scrape-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        setState({
          status: "error",
          products: [],
          error: data.error || "Failed to scrape products",
        });
        return;
      }

      const data: ScrapeProductsResult = await res.json();
      setState({
        status: "success",
        products: data.products,
        storeName: data.storeName,
        platform: data.platform,
      });
    } catch (err) {
      setState({
        status: "error",
        products: [],
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", products: [] });
  }, []);

  return { ...state, scrape, reset };
}
