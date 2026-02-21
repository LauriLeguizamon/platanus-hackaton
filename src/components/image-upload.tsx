"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function ImageUpload({ file, onFileChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  const validateAndSet = useCallback(
    (f: File) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        return;
      }
      if (f.size > MAX_SIZE) {
        return;
      }
      onFileChange(f);
    },
    [onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) validateAndSet(f);
    },
    [validateAndSet]
  );

  if (file && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg border">
        <img
          src={previewUrl}
          alt="Product preview"
          className="h-48 w-full object-contain bg-muted/30"
        />
        <div className="flex items-center justify-between border-t px-3 py-2">
          <span className="truncate text-xs text-muted-foreground">
            {file.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFileChange(null)}
            className="h-6 w-6 p-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
        dragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        {dragActive ? (
          <Upload className="h-5 w-5 text-primary" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drop your product image here</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, or WebP up to 10MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
