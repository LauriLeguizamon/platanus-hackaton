"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatImage {
  url: string;
  width: number;
  height: number;
}

export function ChatImageGrid({ images }: { images: ChatImage[] }) {
  async function handleDownload(url: string, index: number) {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `product-photo-${index + 1}.png`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div
      className={`grid gap-2 ${images.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-2 max-w-lg"}`}
    >
      {images.map((image, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border bg-card animate-in fade-in zoom-in-95 duration-500"
          style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={`Generated product photo ${i + 1}`}
            className="w-full object-contain"
            style={{ aspectRatio: `${image.width}/${image.height}` }}
          />
          <div className="flex items-center justify-between border-t px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {image.width} x {image.height}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(image.url, i)}
              className="h-7 gap-1.5 text-xs"
            >
              <Download className="h-3 w-3" />
              Save
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
