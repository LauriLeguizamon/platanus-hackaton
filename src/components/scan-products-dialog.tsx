"use client";

import { useState } from "react";
import { Globe, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { MAX_PRODUCT_IMAGES } from "@/lib/constants";
import type { ScrapedProduct, ScrapeProductsResult } from "@/lib/types";

interface ScanProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: ScrapedProduct[]) => void;
}

export function ScanProductsDialog({
  open,
  onOpenChange,
  onImport,
}: ScanProductsDialogProps) {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState<ScrapedProduct[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [storeName, setStoreName] = useState<string>();
  const [platform, setPlatform] = useState<string>();
  const [hasScanned, setHasScanned] = useState(false);

  function resetState() {
    setProducts([]);
    setSelectedIndices(new Set());
    setStoreName(undefined);
    setPlatform(undefined);
    setHasScanned(false);
  }

  async function handleScan() {
    if (!url.trim()) {
      toast.error("Please enter a store URL");
      return;
    }

    setIsScanning(true);
    resetState();

    try {
      const response = await fetch("/api/scrape-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan website");
      }

      const result = data as ScrapeProductsResult;
      setProducts(result.products);
      setStoreName(result.storeName);
      setPlatform(result.platform);
      setHasScanned(true);

      // Auto-select first MAX_PRODUCT_IMAGES products
      const autoSelect = new Set<number>();
      for (let i = 0; i < Math.min(result.products.length, MAX_PRODUCT_IMAGES); i++) {
        autoSelect.add(i);
      }
      setSelectedIndices(autoSelect);

      toast.success(`Found ${result.products.length} products`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to scan website";
      toast.error(message);
    } finally {
      setIsScanning(false);
    }
  }

  function toggleProduct(index: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (next.size >= MAX_PRODUCT_IMAGES) {
          toast.error(`Maximum ${MAX_PRODUCT_IMAGES} products can be selected`);
          return prev;
        }
        next.add(index);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedIndices.size === Math.min(products.length, MAX_PRODUCT_IMAGES)) {
      setSelectedIndices(new Set());
    } else {
      const next = new Set<number>();
      for (let i = 0; i < Math.min(products.length, MAX_PRODUCT_IMAGES); i++) {
        next.add(i);
      }
      setSelectedIndices(next);
    }
  }

  function handleImport() {
    const selected = products.filter((_, i) => selectedIndices.has(i));
    onImport(selected);
    onOpenChange(false);
    // Reset for next use
    setUrl("");
    resetState();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Scan E-commerce Store
          </DialogTitle>
          <DialogDescription>
            Enter a store URL to find products and import their images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* URL Input */}
          <div className="flex gap-2">
            <Input
              placeholder="store.myshopify.com or tienda.mitienda.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleScan}
              disabled={isScanning}
              className="h-9 shrink-0"
            >
              {isScanning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              Scan
            </Button>
          </div>

          {/* Results */}
          {hasScanned && products.length > 0 && (
            <>
              {/* Status bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Found <strong className="text-foreground">{products.length}</strong> products
                    {storeName && (
                      <> on <strong className="text-foreground">{storeName}</strong></>
                    )}
                  </span>
                  {platform && platform !== "generic" && (
                    <Badge variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAll}
                  className="text-xs h-7"
                >
                  {selectedIndices.size === Math.min(products.length, MAX_PRODUCT_IMAGES)
                    ? "Deselect All"
                    : `Select ${MAX_PRODUCT_IMAGES}`}
                </Button>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 pr-1">
                {products.map((product, index) => {
                  const isSelected = selectedIndices.has(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleProduct(index)}
                      className={`relative rounded-lg border p-2 text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-2 right-2 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleProduct(index)}
                        />
                      </div>

                      {/* Image */}
                      <div className="relative mb-2 overflow-hidden rounded bg-muted/30">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-28 w-full object-contain"
                          loading="lazy"
                        />
                      </div>

                      {/* Name */}
                      <p className="text-xs font-medium truncate pr-6">
                        {product.name}
                      </p>

                      {/* Price */}
                      {product.price && (
                        <p className="text-xs text-muted-foreground truncate">
                          {product.price}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Empty state after scan */}
          {hasScanned && products.length === 0 && !isScanning && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No products found. Try a product listing or collection page.
              </p>
            </div>
          )}

          {/* Scanning state */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Scanning for products...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIndices.size === 0}
          >
            <Check className="h-4 w-4" />
            Import {selectedIndices.size} Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
