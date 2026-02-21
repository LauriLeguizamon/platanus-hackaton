import { Upload, SlidersHorizontal, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "1",
    icon: Upload,
    title: "Upload your product photo",
    description:
      "Drag and drop or browse for your product image. Supports PNG, JPG, and WebP up to 10MB.",
  },
  {
    step: "2",
    icon: SlidersHorizontal,
    title: "Configure your settings",
    description:
      "Choose placement type, image style, AI model, aspect ratio, and how many images you need.",
  },
  {
    step: "3",
    icon: Wand2,
    title: "Generate and download",
    description:
      "Hit generate and get professional product images in seconds. Download them individually or all at once.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Three Steps to Better Product Photos
          </h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Step {s.step}
              </span>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
