"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCCASION_OPTIONS } from "@/lib/constants";
import type { OccasionType } from "@/lib/types";

interface OptionsSelectorProps {
  hasDiscount: boolean;
  onHasDiscountChange: (value: boolean) => void;
  discountText: string;
  onDiscountTextChange: (value: string) => void;
  hasOccasion: boolean;
  onHasOccasionChange: (value: boolean) => void;
  occasion: OccasionType | undefined;
  onOccasionChange: (value: OccasionType) => void;
}

export function OptionsSelector({
  hasDiscount,
  onHasDiscountChange,
  discountText,
  onDiscountTextChange,
  hasOccasion,
  onHasOccasionChange,
  occasion,
  onOccasionChange,
}: OptionsSelectorProps) {
  return (
    <div className="space-y-3">
      <label
        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
          hasDiscount
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/50"
        }`}
      >
        <Checkbox
          checked={hasDiscount}
          onCheckedChange={(checked) => onHasDiscountChange(checked === true)}
        />
        Discount
      </label>

      {hasDiscount && (
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-muted-foreground">Discount text</Label>
          <Input
            value={discountText}
            onChange={(e) => onDiscountTextChange(e.target.value)}
            placeholder="e.g. 50% OFF"
            className="h-8"
          />
        </div>
      )}

      <label
        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
          hasOccasion
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/50"
        }`}
      >
        <Checkbox
          checked={hasOccasion}
          onCheckedChange={(checked) => onHasOccasionChange(checked === true)}
        />
        Special Occasion
      </label>

      {hasOccasion && (
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs text-muted-foreground">Occasion</Label>
          <Select
            value={occasion}
            onValueChange={(v) => onOccasionChange(v as OccasionType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select occasion" />
            </SelectTrigger>
            <SelectContent>
              {OCCASION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
