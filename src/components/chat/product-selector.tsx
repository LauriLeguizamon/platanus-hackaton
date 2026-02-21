"use client";

import { useState } from "react";
import type { ScrapedProduct } from "@/lib/types";
import { PRODUCTS_PER_PAGE, MAX_SELECTED_PRODUCTS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Store,
  Check,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface ProductSelectorProps {
  status: "loading" | "success" | "error";
  products: ScrapedProduct[];
  storeName?: string;
  error?: string;
  onConfirm: (selected: { url: string; name: string }[]) => void;
  onDismiss: () => void;
  confirmed: boolean;
  confirmedProducts?: { url: string; name: string }[];
}

export function ProductSelector({
  status,
  products,
  storeName,
  error,
  onConfirm,
  onDismiss,
  confirmed,
  confirmedProducts,
}: ProductSelectorProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const pageProducts = products.slice(
    currentPage * PRODUCTS_PER_PAGE,
    (currentPage + 1) * PRODUCTS_PER_PAGE
  );

  function toggleProduct(globalIndex: number) {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) {
        next.delete(globalIndex);
      } else if (next.size < MAX_SELECTED_PRODUCTS) {
        next.add(globalIndex);
      }
      return next;
    });
  }

  function handleConfirm() {
    const selected = Array.from(selectedIndices).map((i) => ({
      url: products[i].imageUrl,
      name: products[i].name,
    }));
    onConfirm(selected);
  }

  // Confirmed state — compact summary
  if (confirmed && confirmedProducts && confirmedProducts.length > 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 animate-in fade-in duration-300">
        <Check className="h-4 w-4 text-green-500 shrink-0" />
        <div className="flex items-center gap-2 overflow-x-auto">
          {confirmedProducts.map((p) => (
            <div
              key={p.url}
              className="shrink-0 rounded-lg overflow-hidden border w-10 h-10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {confirmedProducts.length} product
            {confirmedProducts.length > 1 ? "s" : ""} added
            {storeName ? ` from ${storeName}` : ""}
          </span>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Scanning for products...</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <div className="rounded-xl border bg-card p-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error || "Failed to scan products"}</span>
        </div>
      </div>
    );
  }

  // No products
  if (products.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Store className="h-4 w-4" />
          <span className="text-sm">
            No products found. Try a product listing or collection page.
          </span>
        </div>
      </div>
    );
  }

  // Success state — product grid with selection
  const atLimit = selectedIndices.size >= MAX_SELECTED_PRODUCTS;

  return (
    <div className="rounded-xl border bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {storeName || "Products"}
          </span>
          <Badge variant="secondary" className="text-xs">
            {products.length} found
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {selectedIndices.size > 0 && (
            <Badge variant="default" className="text-xs">
              {selectedIndices.size}/{MAX_SELECTED_PRODUCTS} selected
            </Badge>
          )}
          <button
            onClick={onDismiss}
            className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {pageProducts.map((product, pageIndex) => {
          const globalIndex = currentPage * PRODUCTS_PER_PAGE + pageIndex;
          const isSelected = selectedIndices.has(globalIndex);
          const isDisabled = atLimit && !isSelected;

          return (
            <button
              key={globalIndex}
              onClick={() => toggleProduct(globalIndex)}
              disabled={isDisabled}
              className={`
                relative text-left rounded-lg border overflow-hidden transition-all duration-200
                ${isSelected ? "ring-2 ring-primary border-primary" : "hover:border-foreground/20"}
                ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Checkbox overlay */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  tabIndex={-1}
                  className="pointer-events-none"
                />
              </div>

              {/* Image */}
              <div className="aspect-square bg-muted/50 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="px-1.5 py-1">
                <p className="text-[11px] font-medium line-clamp-1 leading-tight">
                  {product.name}
                </p>
                {product.price && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {product.price}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer: pagination + confirm */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div />
        )}

        {/* Confirm */}
        <Button
          size="sm"
          disabled={selectedIndices.size === 0}
          onClick={handleConfirm}
          className="gap-1.5"
        >
          <Check className="h-3.5 w-3.5" />
          Use Selected ({selectedIndices.size})
        </Button>
      </div>
    </div>
  );
}
