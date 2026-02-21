"use client";

import { useState } from "react";
import { Palette, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useBrand } from "@/lib/brand-context";
import { BrandSetupDialog } from "@/components/brand-setup-dialog";

export function BrandSummary() {
  const { brand, clearBrand, isLoaded } = useBrand();
  const [editOpen, setEditOpen] = useState(false);

  if (!isLoaded) return null;

  if (!brand) {
    return (
      <>
        <Card>
          <CardContent className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="h-4 w-4" />
              No brand configured
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              Set Up Brand
            </Button>
          </CardContent>
        </Card>
        <BrandSetupDialog
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex gap-1 shrink-0">
                <div
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ backgroundColor: brand.colors.primary }}
                  title={`Primary: ${brand.colors.primary}`}
                />
                <div
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ backgroundColor: brand.colors.secondary }}
                  title={`Secondary: ${brand.colors.secondary}`}
                />
                <div
                  className="h-5 w-5 rounded-full border border-border"
                  style={{ backgroundColor: brand.colors.accent }}
                  title={`Accent: ${brand.colors.accent}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{brand.brandName}</p>
                {brand.tagline && (
                  <p className="text-xs text-muted-foreground truncate">
                    {brand.tagline}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={clearBrand}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <BrandSetupDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editMode
      />
    </>
  );
}
