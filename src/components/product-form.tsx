"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Plus, Shuffle, Globe } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { ImageUpload } from "@/components/image-upload";
import { MultiImageUpload } from "@/components/multi-image-upload";
import { ProductMetaForm } from "@/components/product-meta-form";
import { OptionsSelector } from "@/components/placement-selector";
import { ImageGallery } from "@/components/image-gallery";
import { BrandSummary } from "@/components/brand-summary";
import { ScanProductsDialog } from "@/components/scan-products-dialog";
import { ConfigSection } from "@/components/config-section";
import { useBrand } from "@/lib/brand-context";
import { useSession } from "@/lib/session-context";

import {
  MODEL_OPTIONS,
  ASPECT_RATIOS,
  MAX_IMAGES,
  MAX_PRODUCT_IMAGES,
  DEFAULT_NUM_IMAGES,
  DEFAULT_MODEL,
  DEFAULT_ASPECT_RATIO,
  GENERATION_MODE_OPTIONS,
  OCCASION_OPTIONS,
} from "@/lib/constants";
import type {
  OccasionType,
  ImageType,
  ModelType,
  GeneratedImage,
  GenerationMode,
  ProductMeta,
  ScrapedProduct,
} from "@/lib/types";

export function ProductForm() {
  const { brand } = useBrand();
  const { sessionId, setSessionId, loadedImages } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasOccasion, setHasOccasion] = useState(false);
  const [imageType, setImageType] = useState<ImageType>("product-alone");
  const [model, setModel] = useState<ModelType>(DEFAULT_MODEL);
  const [numImages, setNumImages] = useState(DEFAULT_NUM_IMAGES);
  const [discountText, setDiscountText] = useState("");
  const [occasion, setOccasion] = useState<OccasionType | undefined>();
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [generationKind, setGenerationKind] = useState<"standard" | "variants" | null>(null);
  const isLoading = generationKind !== null;
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [generationMode, setGenerationMode] = useState<GenerationMode>("combine");
  const [products, setProducts] = useState<ProductMeta[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const isMultiImage = files.length > 1;

  // Configured state for collapsible sections
  const generationModeLabel = GENERATION_MODE_OPTIONS.find(
    (o) => o.value === generationMode
  )?.label ?? generationMode;

  const productsConfigured = products.length > 0 &&
    products.every((p) => p.name.trim() && p.price.trim());

  const optionsConfigured = hasDiscount || hasOccasion || additionalDetails.trim().length > 0;
  const optionsLabel = [
    hasDiscount && (discountText || "Discount"),
    hasOccasion && (OCCASION_OPTIONS.find((o) => o.value === occasion)?.label || "Occasion"),
    additionalDetails.trim() && "Custom details",
  ].filter(Boolean).join(" + ");

  const advancedConfigured =
    imageType !== "product-alone" ||
    model !== DEFAULT_MODEL ||
    aspectRatio !== DEFAULT_ASPECT_RATIO ||
    numImages !== DEFAULT_NUM_IMAGES;
  const advancedLabel = [
    imageType !== "product-alone" && "In Use",
    model !== DEFAULT_MODEL && MODEL_OPTIONS.find((o) => o.value === model)?.label,
    aspectRatio !== DEFAULT_ASPECT_RATIO && aspectRatio,
    numImages !== DEFAULT_NUM_IMAGES && `${numImages} images`,
  ].filter(Boolean).join(", ") || undefined;

  // Sync products array with files array
  useEffect(() => {
    setProducts((prev) =>
      files.map((_, i) => prev[i] ?? { name: "", price: "", discount: "" })
    );
  }, [files]);

  // Load images when a session is selected from sidebar
  useEffect(() => {
    setResults(loadedImages);
  }, [loadedImages]);

  // Reset all form state when session is cleared (new session)
  useEffect(() => {
    if (sessionId === null) {
      setFiles([]);
      setHasDiscount(false);
      setHasOccasion(false);
      setImageType("product-alone");
      setModel(DEFAULT_MODEL);
      setNumImages(DEFAULT_NUM_IMAGES);
      setDiscountText("");
      setOccasion(undefined);
      setAspectRatio(DEFAULT_ASPECT_RATIO);
      setGenerationMode("combine");
      setProducts([]);
      setAdditionalDetails("");
      setGenerationKind(null);
    }
  }, [sessionId]);

  // Auto-set aspect ratio for banner mode
  useEffect(() => {
    if (isMultiImage && generationMode === "banner") {
      setAspectRatio("16:9");
    }
  }, [isMultiImage, generationMode]);

  async function handleImportProducts(scrapedProducts: ScrapedProduct[]) {
    setScanDialogOpen(false);
    setIsImporting(true);
    const toastId = toast.loading(`Importing ${scrapedProducts.length} products...`);

    try {
      const importedFiles: File[] = [];
      const importedMeta: ProductMeta[] = [];

      await Promise.all(
        scrapedProducts.map(async (product, i) => {
          try {
            const res = await fetch(
              `/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`
            );
            if (!res.ok) return;
            const blob = await res.blob();
            const ext = blob.type.split("/")[1] || "jpg";
            const fileName = `${product.name || `product-${i}`}.${ext}`.replace(/[/\\?%*:|"<>]/g, "-");
            importedFiles.push(
              new File([blob], fileName, { type: blob.type })
            );
            importedMeta.push({
              name: product.name || "",
              price: product.price || "",
              discount: "",
            });
          } catch {
            // Skip failed images
          }
        })
      );

      if (importedFiles.length === 0) {
        toast.error("Failed to import any products", { id: toastId });
        return;
      }

      const maxToImport = MAX_PRODUCT_IMAGES - files.length;
      const filesToAdd = importedFiles.slice(0, maxToImport);
      const metaToAdd = importedMeta.slice(0, maxToImport);

      setFiles((prev) => [...prev, ...filesToAdd].slice(0, MAX_PRODUCT_IMAGES));
      setProducts((prev) => [...prev, ...metaToAdd].slice(0, MAX_PRODUCT_IMAGES));

      toast.success(`Imported ${filesToAdd.length} products`, { id: toastId });
    } catch {
      toast.error("Failed to import products", { id: toastId });
    } finally {
      setIsImporting(false);
    }
  }

  function buildFormData() {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    formData.append(
      "options",
      JSON.stringify({
        imageType,
        model,
        numImages,
        discountText: hasDiscount ? discountText : undefined,
        occasion: hasOccasion ? occasion : undefined,
        aspectRatio,
        brand: brand || undefined,
        generationMode: isMultiImage ? generationMode : "single",
        products: isMultiImage && generationMode === "banner" ? products : undefined,
        additionalDetails: additionalDetails.trim() || undefined,
        sessionId: sessionId ?? undefined,
      })
    );
    return formData;
  }

  async function handleGenerate() {
    if (files.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (isMultiImage && generationMode === "banner") {
      const incomplete = products.some((p) => !p.name.trim() || !p.price.trim());
      if (incomplete) {
        toast.error("Please fill in name and price for all products");
        return;
      }
    }

    if (hasOccasion && !occasion) {
      toast.error("Please select an occasion");
      return;
    }

    setGenerationKind("standard");
    setResults([]);

    const formData = buildFormData();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      setResults(data.images);
      toast.success(`Generated ${data.images.length} image(s)`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setGenerationKind(null);
    }
  }

  async function handleGenerateVariants() {
    if (files.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    if (numImages <= 1) {
      toast.error("Variants require more than 1 image");
      return;
    }

    if (hasOccasion && !occasion) {
      toast.error("Please select an occasion");
      return;
    }

    setGenerationKind("variants");
    setResults([]);

    const formData = buildFormData();

    try {
      const response = await fetch("/api/generate-variants", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Variant generation failed");
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      setResults(data.images);
      toast.success(`Generated ${data.images.length} variant image(s)`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setGenerationKind(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="w-full shrink-0 lg:w-[400px] space-y-4">
        <BrandSummary />
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Product Image{files.length !== 1 ? "s" : ""}
              </Label>
              {files.length === 0 ? (
                <div className="space-y-2">
                  <MultiImageUpload files={files} onFilesChange={setFiles} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScanDialogOpen(true)}
                    disabled={isImporting}
                    className="w-full text-xs"
                  >
                    {isImporting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {isImporting ? "Importing..." : "Scan Store for Products"}
                  </Button>
                </div>
              ) : files.length === 1 ? (
                <div className="space-y-2">
                  <ImageUpload
                    file={files[0]}
                    onFileChange={(f) => setFiles(f ? [f] : [])}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = "image/png,image/jpeg,image/webp";
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          const newFiles = Array.from(target.files).filter(
                            (f) =>
                              ["image/png", "image/jpeg", "image/webp"].includes(f.type) &&
                              f.size <= 10 * 1024 * 1024
                          );
                          if (newFiles.length > 0) {
                            setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
                          }
                        }
                      };
                      input.click();
                    }}
                    className="w-full text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add more products for Combine/Banner mode
                  </Button>
                </div>
              ) : (
                <MultiImageUpload files={files} onFilesChange={setFiles} />
              )}
            </div>

            {isMultiImage && (
              <>
                <Separator />
                <ConfigSection
                  title="Generation Mode"
                  configured
                  configuredLabel={generationModeLabel}
                  defaultOpen
                >
                  <RadioGroup
                    value={generationMode}
                    onValueChange={(v) => setGenerationMode(v as GenerationMode)}
                    className="grid grid-cols-2 gap-2"
                  >
                    {GENERATION_MODE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex cursor-pointer flex-col gap-0.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                          generationMode === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={opt.value} />
                          {opt.label}
                        </div>
                        <span className="pl-6 text-xs text-muted-foreground">
                          {opt.description}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </ConfigSection>
              </>
            )}

            {isMultiImage && generationMode === "banner" && (
              <>
                <Separator />
                <ConfigSection
                  title="Product Details"
                  configured={productsConfigured}
                  configuredLabel="All filled"
                  defaultOpen
                >
                  <ProductMetaForm
                    files={files}
                    products={products}
                    onProductsChange={setProducts}
                  />
                </ConfigSection>
              </>
            )}

            <Separator />

            <ConfigSection
              title="Options"
              configured={optionsConfigured}
              configuredLabel={optionsLabel}
            >
              <div className="space-y-4">
                <OptionsSelector
                  hasDiscount={hasDiscount}
                  onHasDiscountChange={setHasDiscount}
                  discountText={discountText}
                  onDiscountTextChange={setDiscountText}
                  hasOccasion={hasOccasion}
                  onHasOccasionChange={setHasOccasion}
                  occasion={occasion}
                  onOccasionChange={setOccasion}
                />

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Additional Details</Label>
                  <Textarea
                    placeholder="e.g., on a beach with sunset lighting, minimalist white background..."
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    className="min-h-[60px] text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional free-text to customize the generated image prompt.
                  </p>
                </div>
              </div>
            </ConfigSection>

            <Separator />

            <ConfigSection
              title="Advanced Settings"
              configured={advancedConfigured}
              configuredLabel={advancedLabel}
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Type</Label>
                  <RadioGroup
                    value={imageType}
                    onValueChange={(v) => setImageType(v as ImageType)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        imageType === "product-alone"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value="product-alone" />
                      Product Alone
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                        imageType === "in-use"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <RadioGroupItem value="in-use" />
                      In Use
                    </label>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Model</Label>
                    <Select
                      value={model}
                      onValueChange={(v) => setModel(v as ModelType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Number of Images (max {MAX_IMAGES})
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={MAX_IMAGES}
                    value={numImages}
                    onChange={(e) =>
                      setNumImages(
                        Math.min(Math.max(Number(e.target.value) || 1, 1), MAX_IMAGES)
                      )
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </ConfigSection>

            <div className={numImages > 1 ? "grid grid-cols-2 gap-2" : ""}>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || files.length === 0}
                className="w-full"
              >
                {generationKind === "standard" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>

              {numImages > 1 && (
                <Button
                  onClick={handleGenerateVariants}
                  disabled={isLoading || files.length === 0}
                  variant="outline"
                  className="w-full"
                >
                  {generationKind === "variants" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Variantes...
                    </>
                  ) : (
                    <>
                      <Shuffle className="h-4 w-4" />
                      Variantes
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <ImageGallery
          images={results}
          isLoading={isLoading}
          numExpected={numImages}
        />
      </div>

      <ScanProductsDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        onImport={handleImportProducts}
      />
    </div>
  );
}
