"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OptionItem {
  label: string;
  description?: string;
}

export interface OptionsPanelData {
  toolCallId: string;
  question: string;
  options: OptionItem[];
  allowCustom?: boolean;
  allowSkip?: boolean;
}

interface OptionsPanelProps {
  options: OptionsPanelData | null;
  onSelect: (label: string) => void;
  onSkip: () => void;
  isLoading: boolean;
}

export function OptionsPanel({
  options,
  onSelect,
  onSkip,
  isLoading,
}: OptionsPanelProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [customText, setCustomText] = useState("");
  const prevOptionsRef = useRef<OptionsPanelData | null>(null);

  // Handle mount/unmount animation
  useEffect(() => {
    if (options) {
      setRendered(true);
      setCustomText("");
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      prevOptionsRef.current = options;
    } else {
      // Trigger exit animation
      setVisible(false);
      const timeout = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [options]);

  if (!rendered) return null;

  const data = options ?? prevOptionsRef.current;
  if (!data) return null;

  return (
    <div
      className={`mb-3 overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Question header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug">
            {data.question}
          </h3>
          {data.allowSkip && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground"
              onClick={onSkip}
              disabled={isLoading}
              title="Skip"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Option cards */}
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <button
              key={option.label}
              onClick={() => onSelect(option.label)}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-3 rounded-lg border bg-background
                         hover:bg-accent/50 hover:border-primary/30 transition-all duration-150
                         text-left group disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="shrink-0 h-7 w-7 rounded-full bg-muted text-muted-foreground
                              flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {option.description}
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>

        {/* "Something else" free-text input */}
        {data.allowCustom && (
          <div className="flex items-center gap-2 pt-1">
            <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Something else"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customText.trim()) {
                  onSelect(customText.trim());
                  setCustomText("");
                }
              }}
              disabled={isLoading}
              className="h-8 text-sm"
            />
            {data.allowSkip && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                disabled={isLoading}
                className="shrink-0 text-xs h-8"
              >
                Skip
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
