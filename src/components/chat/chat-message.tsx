"use client";

import type { UIMessage } from "ai";
import { User, Sparkles } from "lucide-react";
import { ChatImageGrid } from "./chat-image-grid";
import { GenerationLoading } from "./generation-loading";

interface ChatMessageProps {
  message: UIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
    >
      {!isUser && (
        <div className="shrink-0 rounded-full bg-primary/10 p-2 h-8 w-8 flex items-center justify-center mt-0.5">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[80%] space-y-3 ${isUser ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5" : ""}`}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text) {
            const displayText = isUser
              ? part.text
                  .replace(/\n*\[Uploaded product image URLs:[^\]]*\]/, "")
                  .replace(/\n*\[Current photo options:[^\]]*\]/, "")
                  .trim()
              : part.text;
            return (
              <p
                key={i}
                className="text-sm leading-relaxed whitespace-pre-wrap"
              >
                {displayText}
              </p>
            );
          }

          // Options tool is rendered above the input, not in chat
          if (part.type === "tool-present_options") {
            return null;
          }

          // Photo options tool updates are shown in the sidebar, not in chat
          if (part.type === "tool-update_photo_options") {
            return null;
          }

          // Handle tool parts — in AI SDK v6, tool parts have type `tool-{toolName}`
          if (part.type.startsWith("tool-")) {
            const toolPart = part as {
              type: string;
              toolCallId: string;
              state: string;
              input?: Record<string, unknown>;
              output?: { success?: boolean; images?: Array<{ url: string; width: number; height: number }> };
            };

            if (toolPart.state === "output-available" && toolPart.output?.success && toolPart.output?.images) {
              return (
                <ChatImageGrid key={i} images={toolPart.output.images} />
              );
            }

            if (toolPart.state === "output-available" && toolPart.output && !toolPart.output.success) {
              return (
                <p key={i} className="text-sm text-destructive">
                  Generation failed. Let me try a different approach.
                </p>
              );
            }

            if (toolPart.state === "output-error") {
              return (
                <p key={i} className="text-sm text-destructive">
                  Something went wrong during generation.
                </p>
              );
            }

            // Loading states — show progress bar + dino game
            if (
              toolPart.state === "input-available" ||
              toolPart.state === "input-streaming"
            ) {
              return <GenerationLoading key={i} />;
            }
          }

          return null;
        })}
      </div>

      {isUser && (
        <div className="shrink-0 rounded-full bg-muted p-2 h-8 w-8 flex items-center justify-center mt-0.5">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
