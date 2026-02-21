"use client";

import { useState, useCallback } from "react";
import { Video } from "lucide-react";

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

import { VIDEO_MODEL_OPTIONS, DEFAULT_VIDEO_MODEL } from "@/lib/constants";
import { buildVideoPrompt } from "@/lib/prompts";
import type { VideoModelType } from "@/lib/types";

interface VideoGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onStartGeneration: (imageUrl: string, model: VideoModelType, prompt: string) => void;
}

export function VideoGenerateDialog({
  open,
  onOpenChange,
  imageUrl,
  onStartGeneration,
}: VideoGenerateDialogProps) {
  const [model, setModel] = useState<VideoModelType>(DEFAULT_VIDEO_MODEL);
  const [prompt, setPrompt] = useState(buildVideoPrompt());

  const handleGenerate = useCallback(() => {
    onStartGeneration(imageUrl, model, prompt);
    onOpenChange(false);
    setPrompt(buildVideoPrompt());
    setModel(DEFAULT_VIDEO_MODEL);
  }, [imageUrl, model, prompt, onStartGeneration, onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setPrompt(buildVideoPrompt());
        setModel(DEFAULT_VIDEO_MODEL);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Video</DialogTitle>
          <DialogDescription>
            Create a short animated video from this product photo.
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
            <Label className="text-sm font-medium">Video Model</Label>
            <Select
              value={model}
              onValueChange={(v) => setModel(v as VideoModelType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_MODEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Animation Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the desired animation..."
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="w-full"
          >
            <Video className="h-4 w-4" />
            Generate Video
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
