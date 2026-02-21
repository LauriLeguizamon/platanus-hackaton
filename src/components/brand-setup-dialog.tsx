"use client";

import { useState, useEffect } from "react";
import { Globe, Loader2, Palette } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useBrand } from "@/lib/brand-context";
import { BRAND_STYLE_OPTIONS } from "@/lib/constants";
import type { BrandStyle, ScrapeResult } from "@/lib/types";

const DISMISSED_KEY = "product-studio-onboarding-dismissed";

interface BrandSetupDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  editMode?: boolean;
}

export function BrandSetupDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  editMode = false,
}: BrandSetupDialogProps) {
  const { brand, setBrand, isLoaded } = useBrand();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#666666");
  const [style, setStyle] = useState<BrandStyle>("minimalist");
  const [isScraping, setIsScraping] = useState(false);

  // Auto-show on first visit if no brand config and not dismissed
  useEffect(() => {
    if (isControlled || !isLoaded || editMode) return;
    if (brand) return;
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) {
        setInternalOpen(true);
      }
    } catch {
      // ignore
    }
  }, [isLoaded, brand, isControlled, editMode]);

  // Pre-fill form when editing existing brand
  useEffect(() => {
    if (brand && editMode && open) {
      setBrandName(brand.brandName);
      setTagline(brand.tagline);
      setPrimaryColor(brand.colors.primary);
      setSecondaryColor(brand.colors.secondary);
      setAccentColor(brand.colors.accent);
      setStyle(brand.style);
      setWebsiteUrl(brand.websiteUrl || "");
    }
  }, [brand, editMode, open]);

  function handleOpenChange(value: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  }

  async function handleScrape() {
    if (!websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsScraping(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape website");
      }

      const result = data as ScrapeResult;
      if (result.brandName) setBrandName(result.brandName);
      if (result.tagline) setTagline(result.tagline);
      if (result.colors.primary) setPrimaryColor(result.colors.primary);
      if (result.colors.secondary) setSecondaryColor(result.colors.secondary);
      if (result.colors.accent) setAccentColor(result.colors.accent);

      toast.success("Brand info extracted successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to scrape website";
      toast.error(message);
    } finally {
      setIsScraping(false);
    }
  }

  function handleSave() {
    if (!brandName.trim()) {
      toast.error("Please enter a brand name");
      return;
    }

    setBrand({
      brandName: brandName.trim(),
      tagline: tagline.trim(),
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      style,
      websiteUrl: websiteUrl.trim() || undefined,
    });

    toast.success("Brand saved");
    handleOpenChange(false);
  }

  function handleSkip() {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {editMode ? "Edit Brand" : "Set Up Your Brand"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update your brand settings to customize generated images."
              : "Customize generated images with your brand identity. You can skip this and set it up later."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Website URL</Label>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-9"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleScrape}
                disabled={isScraping}
                className="h-9 shrink-0"
              >
                {isScraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Scan
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Brand Name</Label>
            <Input
              placeholder="Your Brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Tagline</Label>
            <Input
              placeholder="Your brand tagline or slogan"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Brand Colors</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Primary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-md border border-border p-0.5"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Secondary</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-md border border-border p-0.5"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-md border border-border p-0.5"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-9 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Brand Style</Label>
            <Select value={style} onValueChange={(v) => setStyle(v as BrandStyle)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BRAND_STYLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          {!editMode && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}
          <Button onClick={handleSave}>
            {editMode ? "Update Brand" : "Save Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
