"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_PRODUCT_IMAGES } from "@/lib/constants";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface MultiImageUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function MultiImageUpload({ files, onFilesChange }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const validateFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const valid: File[] = [];
      const remaining = MAX_PRODUCT_IMAGES - files.length;
      for (let i = 0; i < Math.min(newFiles.length, remaining); i++) {
        const f = newFiles[i];
        if (ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE) {
          valid.push(f);
        }
      }
      if (valid.length > 0) {
        onFilesChange([...files, ...valid]);
      }
    },
    [files, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      validateFiles(e.dataTransfer.files);
    },
    [validateFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        validateFiles(e.target.files);
      }
      e.target.value = "";
    },
    [validateFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  if (files.length > 0) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {files.map((file, i) => (
            <div key={`${file.name}-${file.size}-${i}`} className="relative overflow-hidden rounded-lg border">
              <img
                src={previewUrls[i]}
                alt={file.name}
                className="h-24 w-full object-contain bg-muted/30"
              />
              <div className="flex items-center justify-between border-t px-2 py-1">
                <span className="truncate text-xs text-muted-foreground max-w-[80px]">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(i)}
                  className="h-5 w-5 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {files.length < MAX_PRODUCT_IMAGES && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="w-full text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add more products ({files.length}/{MAX_PRODUCT_IMAGES})
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleChange}
              className="hidden"
            />
          </>
        )}
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
        <p className="text-sm font-medium">Drop your product images here</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, or WebP up to 10MB (max {MAX_PRODUCT_IMAGES})
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
