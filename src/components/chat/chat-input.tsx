"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowRight, Paperclip, Pencil, X, Loader2 } from "lucide-react";
import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import type { OptionsPanelData } from "./options-panel";

interface UploadedImage {
  url: string;
  name: string;
}

interface ChatInputProps {
  onSend: (text: string) => void;
  isDisabled: boolean;
  onImagesUploaded: (images: UploadedImage[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (url: string) => void;
  placeholder?: string;
  options?: OptionsPanelData | null;
  onOptionSelect?: (label: string) => void;
  onOptionSkip?: () => void;
}

export function ChatInput({
  onSend,
  isDisabled,
  onImagesUploaded,
  uploadedImages,
  onRemoveImage,
  placeholder,
  options,
  onOptionSelect,
  onOptionSkip,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customText, setCustomText] = useState("");

  // Animation state for options
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [optionsRendered, setOptionsRendered] = useState(false);
  const prevOptionsRef = useRef<OptionsPanelData | null>(null);

  useEffect(() => {
    if (options) {
      setOptionsRendered(true);
      setCustomText("");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOptionsVisible(true));
      });
      prevOptionsRef.current = options;
    } else {
      setOptionsVisible(false);
      const timeout = setTimeout(() => setOptionsRendered(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [options]);

  const optionsData = options ?? prevOptionsRef.current;
  const hasOptions = optionsRendered && optionsData;

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const value = textareaRef.current?.value.trim();
    if (!value || isDisabled) return;
    onSend(value);
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onImagesUploaded(data.images);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2">
      {/* Image previews — only when no options are showing */}
      {!hasOptions && uploadedImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {uploadedImages.map((img) => (
            <div
              key={img.url}
              className="relative group rounded-lg overflow-hidden border w-16 h-16 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemoveImage(img.url)}
                className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Unified input container */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ease-out ${
          hasOptions
            ? "rounded-2xl border-2 border-border bg-card"
            : ""
        }`}
      >
        {/* Inline options section */}
        {hasOptions && optionsData && (
          <div
            className={`transition-all duration-300 ease-out ${
              optionsVisible
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 pb-2 space-y-3">
              {/* Question header */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug">
                  {optionsData.question}
                </h3>
                {optionsData.allowSkip && onOptionSkip && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 text-muted-foreground"
                    onClick={onOptionSkip}
                    disabled={isDisabled}
                    title="Skip"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Option cards */}
              <div className="space-y-2">
                {optionsData.options.map((option, index) => (
                  <button
                    key={option.label}
                    onClick={() => onOptionSelect?.(option.label)}
                    disabled={isDisabled}
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
              {optionsData.allowCustom && (
                <div className="flex items-center gap-2 pt-1">
                  <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Something else"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customText.trim()) {
                        onOptionSelect?.(customText.trim());
                        setCustomText("");
                      }
                    }}
                    disabled={isDisabled}
                    className="h-8 text-sm"
                  />
                  {optionsData.allowSkip && onOptionSkip && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOptionSkip}
                      disabled={isDisabled}
                      className="shrink-0 text-xs h-8"
                    >
                      Skip
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Textarea input row */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ??
              (hasOptions
                ? "Or type your own answer..."
                : uploadedImages.length === 0
                  ? "Upload product images to get started..."
                  : "Describe what you want or answer the assistant...")
            }
            className={`min-h-[52px] max-h-[200px] resize-none pl-11 pr-12 focus-visible:ring-0 transition-colors ${
              hasOptions
                ? "border-0 border-t rounded-none focus-visible:border-primary/50"
                : "rounded-2xl border-2 focus-visible:border-primary/50"
            }`}
            rows={1}
            disabled={isDisabled}
          />

          {/* Attach button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDisabled}
            className="absolute bottom-2 left-2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={isDisabled}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
