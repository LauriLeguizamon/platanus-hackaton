"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session-context";

interface SessionSummary {
  id: string;
  name: string;
  createdAt: string;
  generations: Array<{ cloudinaryUrl: string }>;
}

export function SessionSidebar() {
  const { sessionId, setSessionId, clearSession, setLoadedImages } =
    useSession();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => {});
  }, [sessionId]);

  async function handleLoadSession(id: string) {
    const response = await fetch(`/api/sessions/${id}`);
    const data = await response.json();
    setSessionId(id);
    setLoadedImages(
      (data.session.generations ?? [])
        .filter((g: { type: string }) => g.type === "image")
        .map(
          (g: {
            id: string;
            cloudinaryUrl: string;
            width: number;
            height: number;
            prompt?: string;
          }) => ({
            id: g.id,
            url: g.cloudinaryUrl,
            width: g.width,
            height: g.height,
            prompt: g.prompt ?? undefined,
          })
        )
    );
  }

  return (
    <aside className="w-56 shrink-0 border-r bg-muted/30 p-3 space-y-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          Sessions
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={clearSession}
          title="New Session"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {sessions.length === 0 && (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No sessions yet. Generate some images to get started.
        </p>
      )}

      <div className="space-y-1.5">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => handleLoadSession(s.id)}
            className={`w-full rounded-md border p-2 text-left text-xs transition-colors hover:bg-muted/50 ${
              s.id === sessionId
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <p className="font-medium truncate">{s.name}</p>
            <p className="text-muted-foreground mt-0.5">
              {new Date(s.createdAt).toLocaleDateString()}
            </p>
            {s.generations[0] ? (
              <img
                src={s.generations[0].cloudinaryUrl}
                alt=""
                className="mt-1.5 h-20 w-full rounded object-cover"
              />
            ) : (
              <div className="mt-1.5 flex h-20 w-full items-center justify-center rounded bg-muted">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
