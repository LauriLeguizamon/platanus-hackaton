"use client";

import { useState, useCallback } from "react";
import { Download, ImageIcon, Video, Loader2, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { VideoGenerateDialog } from "@/components/video-generate-dialog";
import { CaptionGenerateDialog } from "@/components/caption-generate-dialog";
import { useVideoGeneration } from "@/hooks/use-video-generation";
import type { GeneratedImage } from "@/lib/types";

interface ImageGalleryProps {
  images: GeneratedImage[];
  isLoading: boolean;
  numExpected: number;
}

export function ImageGallery({
  images,
  isLoading,
  numExpected,
}: ImageGalleryProps) {
  const [videoDialogUrl, setVideoDialogUrl] = useState<string | null>(null);
  const [captionDialogImage, setCaptionDialogImage] = useState<{
    url: string;
    prompt?: string;
  } | null>(null);
  const { videoJobs, startGeneration, clearJob } = useVideoGeneration();

  const handleDownload = useCallback(
    async (url: string, index: number) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `product-photo-${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    },
    []
  );

  const handleDownloadVideo = useCallback(
    async (url: string, index: number) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `product-video-${index + 1}.mp4`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    },
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground animate-pulse">
          Generating your product photos...
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: numExpected }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <ImageIcon className="h-10 w-10" />
        <p className="text-sm">Generated images will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((image, index) => {
          const job = videoJobs[image.url];

          return (
            <Card key={index} className="overflow-hidden">
              {job?.status === "done" && job.video ? (
                <div className="relative">
                  <video
                    src={job.video.url}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full object-contain"
                    style={{ aspectRatio: `${image.width}/${image.height}` }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearJob(image.url)}
                    className="absolute top-2 right-2 h-7 w-7 p-0 bg-background/80 hover:bg-background"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={image.url}
                    alt={`Generated product photo ${index + 1}`}
                    className="w-full object-contain"
                    style={{ aspectRatio: `${image.width}/${image.height}` }}
                  />
                  {job?.status === "generating" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                      <span className="mt-2 text-sm font-medium text-white">
                        Generating video...
                      </span>
                    </div>
                  )}
                  {job?.status === "error" && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <Badge variant="destructive" className="text-xs">
                        Video failed
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearJob(image.url)}
                        className="h-5 w-5 p-0 text-white hover:text-white/80"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {image.prompt && (
                <div className="border-t px-3 py-2">
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    <span className="font-medium text-foreground">Prompt:</span>{" "}
                    {image.prompt}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between border-t px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {image.width} x {image.height}
                </span>
                <div className="flex gap-1">
                  {job?.status === "done" && job.video ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadVideo(job.video!.url, index)}
                      className="h-7 gap-1.5 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Video
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVideoDialogUrl(image.url)}
                        disabled={job?.status === "generating"}
                        className="h-7 gap-1.5 text-xs"
                      >
                        {job?.status === "generating" ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Video className="h-3.5 w-3.5" />
                            Video
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCaptionDialogImage({
                            url: image.url,
                            prompt: image.prompt,
                          })
                        }
                        className="h-7 gap-1.5 text-xs"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Social Post
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(image.url, index)}
                        className="h-7 gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <VideoGenerateDialog
        open={videoDialogUrl !== null}
        onOpenChange={(open) => {
          if (!open) setVideoDialogUrl(null);
        }}
        imageUrl={videoDialogUrl ?? ""}
        onStartGeneration={startGeneration}
      />
      <CaptionGenerateDialog
        open={captionDialogImage !== null}
        onOpenChange={(open) => {
          if (!open) setCaptionDialogImage(null);
        }}
        imageUrl={captionDialogImage?.url ?? ""}
        prompt={captionDialogImage?.prompt}
      />
    </>
  );
}
