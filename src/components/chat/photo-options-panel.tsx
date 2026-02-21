"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { OCCASION_OPTIONS, ASPECT_RATIOS } from "@/lib/constants";
import type { OccasionType } from "@/lib/types";

export interface PhotoOptions {
  imageType?: "product-alone" | "in-use";
  occasion?: OccasionType | "none";
  discountText?: string;
  aspectRatio?: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  numImages?: number;
  additionalDetails?: string;
}

interface PhotoOptionsPanelProps {
  options: PhotoOptions;
  onOptionChange: <K extends keyof PhotoOptions>(
    key: K,
    value: PhotoOptions[K]
  ) => void;
}

export function PhotoOptionsPanel({
  options,
  onOptionChange,
}: PhotoOptionsPanelProps) {
  const hasAnyOption = Object.values(options).some((v) => v !== undefined);

  if (!hasAnyOption) {
    return (
      <p className="text-xs text-muted-foreground">
        Options will appear here as you discuss preferences with the AI.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {options.imageType !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Image Type</Label>
          <Select
            value={options.imageType}
            onValueChange={(v) =>
              onOptionChange("imageType", v as PhotoOptions["imageType"])
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product-alone">Product Alone</SelectItem>
              <SelectItem value="in-use">In Use (Lifestyle)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {options.occasion !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Occasion / Theme
          </Label>
          <Select
            value={options.occasion}
            onValueChange={(v) =>
              onOptionChange("occasion", v as PhotoOptions["occasion"])
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific occasion</SelectItem>
              {OCCASION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {options.discountText !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Discount / Promo Text
          </Label>
          <Input
            value={options.discountText}
            onChange={(e) => onOptionChange("discountText", e.target.value)}
            placeholder='e.g. "50% OFF"'
            className="h-8 text-sm"
          />
        </div>
      )}

      {options.aspectRatio !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Aspect Ratio</Label>
          <Select
            value={options.aspectRatio}
            onValueChange={(v) =>
              onOptionChange("aspectRatio", v as PhotoOptions["aspectRatio"])
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ar) => (
                <SelectItem key={ar.value} value={ar.value}>
                  {ar.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {options.numImages !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Number of Images: {options.numImages}
          </Label>
          <Slider
            value={[options.numImages]}
            onValueChange={([v]) => onOptionChange("numImages", v)}
            min={1}
            max={4}
            step={1}
          />
        </div>
      )}

      {options.additionalDetails !== undefined && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Additional Details
          </Label>
          <Input
            value={options.additionalDetails}
            onChange={(e) =>
              onOptionChange("additionalDetails", e.target.value)
            }
            placeholder="Extra styling instructions..."
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
}
