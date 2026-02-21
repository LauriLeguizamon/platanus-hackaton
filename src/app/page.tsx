import { ProductForm } from "@/components/product-form";
import { BrandSetupDialog } from "@/components/brand-setup-dialog";
import { SessionSidebar } from "@/components/session-sidebar";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <SessionSidebar />
      <div className="flex-1 min-w-0">
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Product Photo Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered product photography
              </p>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background hover:bg-muted transition-colors text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              AI Chat
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">
          <ProductForm />
        </main>
        <BrandSetupDialog />
      </div>
    </div>
  );
}
