import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to Transform Your Product Photos?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start generating professional product images in seconds. No design
          skills required.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <a href="/">
              Try It Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
