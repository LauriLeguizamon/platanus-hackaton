"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/session-context";
import type { VideoModelType, VideoJob } from "@/lib/types";

export function useVideoGeneration() {
  const [videoJobs, setVideoJobs] = useState<Record<string, VideoJob>>({});
  const { sessionId } = useSession();

  const startGeneration = useCallback(
    async (imageUrl: string, model: VideoModelType, prompt: string) => {
      setVideoJobs((prev) => ({
        ...prev,
        [imageUrl]: { status: "generating" },
      }));

      try {
        const response = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl,
            model,
            prompt,
            sessionId: sessionId ?? undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Video generation failed");
        }

        setVideoJobs((prev) => ({
          ...prev,
          [imageUrl]: { status: "done", video: data.video },
        }));
        toast.success("Video generated successfully!");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setVideoJobs((prev) => ({
          ...prev,
          [imageUrl]: { status: "error", error: message },
        }));
        toast.error(message);
      }
    },
    [sessionId]
  );

  const clearJob = useCallback((imageUrl: string) => {
    setVideoJobs((prev) => {
      const next = { ...prev };
      delete next[imageUrl];
      return next;
    });
  }, []);

  return { videoJobs, startGeneration, clearJob };
}
