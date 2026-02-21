"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ProductMeta } from "@/lib/types";

interface ProductMetaFormProps {
  files: File[];
  products: ProductMeta[];
  onProductsChange: (products: ProductMeta[]) => void;
}

export function ProductMetaForm({ files, products, onProductsChange }: ProductMetaFormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function updateProduct(index: number, field: keyof ProductMeta, value: string) {
    const updated = products.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onProductsChange(updated);
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Product Details</Label>
      {files.map((file, i) => (
        <div
          key={`${file.name}-${file.size}-${i}`}
          className="flex gap-3 rounded-md border p-3"
        >
          <img
            src={previewUrls[i]}
            alt={file.name}
            className="h-16 w-16 shrink-0 rounded object-contain bg-muted/30"
          />
          <div className="flex-1 space-y-2">
            <Input
              value={products[i]?.name ?? ""}
              onChange={(e) => updateProduct(i, "name", e.target.value)}
              placeholder="Product name"
              className="h-7 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={products[i]?.price ?? ""}
                onChange={(e) => updateProduct(i, "price", e.target.value)}
                placeholder="Price (e.g. $49.99)"
                className="h-7 text-xs"
              />
              <Input
                value={products[i]?.discount ?? ""}
                onChange={(e) => updateProduct(i, "discount", e.target.value)}
                placeholder="Discount (optional)"
                className="h-7 text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
