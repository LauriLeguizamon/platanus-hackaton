import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Powered by fal.ai
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Transform Your Product Photos with AI
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Upload a product photo, choose your style and placement, and generate
          stunning visuals for e-commerce, social media, banners, and more.
        </p>
        <div className="mt-10">
          <Button size="lg" asChild>
            <a href="/">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Generating
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
