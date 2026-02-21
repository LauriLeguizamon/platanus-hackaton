"use client";

import { Sparkles } from "lucide-react";
import { useSimulatedProgress } from "@/hooks/use-simulated-progress";
import { DinoGame } from "./dino-game";

export function GenerationLoading() {
  const { progress, elapsedSeconds } = useSimulatedProgress(true);

  return (
    <div className="w-full max-w-md space-y-3 animate-in fade-in duration-500">
      {/* Status line */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Generating your product photos...</span>
        </div>
        <span className="tabular-nums text-xs">{elapsedSeconds}s</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dino game */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <DinoGame />
      </div>

      {/* Controls hint */}
      <p className="text-xs text-muted-foreground text-center">
        Press Space or tap to jump while you wait!
      </p>
    </div>
  );
}
