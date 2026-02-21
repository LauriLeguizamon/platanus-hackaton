"use client";

import { ImageIcon, Settings2, SlidersHorizontal } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BrandSummary } from "@/components/brand-summary";
import {
  PhotoOptionsPanel,
  type PhotoOptions,
} from "@/components/chat/photo-options-panel";

interface UploadedImage {
  url: string;
  name: string;
}

interface ChatSidebarProps {
  uploadedImages: UploadedImage[];
  photoOptions: PhotoOptions;
  onPhotoOptionChange: <K extends keyof PhotoOptions>(
    key: K,
    value: PhotoOptions[K]
  ) => void;
}

export function ChatSidebar({
  uploadedImages,
  photoOptions,
  onPhotoOptionChange,
}: ChatSidebarProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Uploaded images section */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Product Images</h2>
      </div>
      {uploadedImages.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No images uploaded yet. Use the attach button to upload product images.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {uploadedImages.map((img) => (
            <div
              key={img.url}
              className="rounded-lg overflow-hidden border bg-muted/30 animate-in fade-in duration-300"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="w-full aspect-square object-cover"
              />
              <p className="text-[10px] text-muted-foreground truncate px-1.5 py-1">
                {img.name}
              </p>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Brand config */}
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Brand Configuration</h2>
      </div>
      <BrandSummary />

      <Separator />

      {/* Photo Options */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Photo Options</h2>
      </div>
      <PhotoOptionsPanel
        options={photoOptions}
        onOptionChange={onPhotoOptionChange}
      />
    </div>
  );
}
