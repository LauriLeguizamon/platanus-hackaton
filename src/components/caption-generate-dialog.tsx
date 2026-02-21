"use client";

import { useState, useCallback } from "react";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SOCIAL_PLATFORM_OPTIONS } from "@/lib/constants";
import type { SocialPlatform } from "@/lib/types";

interface CaptionGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  prompt?: string;
}

export function CaptionGenerateDialog({
  open,
  onOpenChange,
  imageUrl,
  prompt,
}: CaptionGenerateDialogProps) {
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setCaption("");
        setPlatform("instagram");
        setCopied(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setCopied(false);
    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, platform, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCaption(data.caption);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate caption"
      );
    } finally {
      setIsLoading(false);
    }
  }, [imageUrl, platform, prompt]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [caption]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Social Media Post</DialogTitle>
          <DialogDescription>
            Generate a marketing-optimized caption for this product image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border">
            <img
              src={imageUrl}
              alt="Source image"
              className="h-32 w-full object-contain bg-muted/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Platform</Label>
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v as SocialPlatform)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Caption
              </>
            )}
          </Button>

          {caption && (
            <div className="space-y-2">
              <Textarea
                value={caption}
                readOnly
                rows={8}
                className="resize-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="w-full gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
