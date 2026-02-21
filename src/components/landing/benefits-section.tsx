import {
  Eye,
  Images,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Cpu,
  Gift,
  Tag,
  Heart,
  Snowflake,
  GraduationCap,
  Sun,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function SectionHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="outline" className="mb-4">
        {badge}
      </Badge>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  );
}

/* ─── Image Styles ─── */

function ImageStylesBenefits() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          badge="Image Styles"
          title="Show It Your Way"
          description="Choose between a clean product-only shot or a lifestyle image that tells a story."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border shadow-none">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                <Images className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Product Alone</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Isolated, distraction-free product shots on clean backgrounds.
                Perfect for catalogs, comparison pages, and marketplace
                listings where the product speaks for itself.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">Catalogs</Badge>
                <Badge variant="secondary">Marketplaces</Badge>
                <Badge variant="secondary">Spec sheets</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border shadow-none">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">In Use</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Lifestyle imagery showing your product in real-world settings.
                Helps customers visualize ownership and drives emotional
                connection with your brand.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">Social media</Badge>
                <Badge variant="secondary">Ads</Badge>
                <Badge variant="secondary">Landing pages</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─── Special Occasions ─── */

const occasions = [
  {
    icon: Gift,
    title: "Christmas",
    description:
      "Warm golden lighting, snow, pine branches, and festive ribbons that capture the holiday spirit.",
  },
  {
    icon: Tag,
    title: "Black Friday",
    description:
      "Bold dark themes with neon accents and dramatic sale aesthetics that create urgency.",
  },
  {
    icon: Heart,
    title: "Valentine's Day",
    description:
      "Romantic pink and red tones with soft lighting, hearts, and elegant floral touches.",
  },
  {
    icon: Snowflake,
    title: "New Year",
    description:
      "Celebratory sparkle and confetti-laden visuals that ring in fresh starts and new beginnings.",
  },
  {
    icon: Sun,
    title: "Summer Sale",
    description:
      "Bright, vibrant imagery with warm tones and outdoor energy that drives seasonal purchases.",
  },
  {
    icon: GraduationCap,
    title: "Back to School",
    description:
      "Clean, organized aesthetics with academic touches that resonate with students and parents.",
  },
];

function OccasionsBenefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          badge="Seasonal Campaigns"
          title="Ready for Every Season"
          description="Pre-built themes for major shopping events so your product images match the moment."
        />
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {occasions.map((o) => (
            <div
              key={o.title}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <o.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {o.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AI Models ─── */

const models = [
  {
    icon: Zap,
    title: "Nano Banana",
    label: "Default",
    description:
      "Lightning-fast generation for quick iterations. Ideal when you need volume and speed — perfect for A/B testing multiple variants.",
    highlights: ["Fastest generation", "Great for bulk", "Low cost per image"],
  },
  {
    icon: Target,
    title: "Nano Banana Pro",
    label: "Premium",
    description:
      "Maximum detail and realism for hero images and premium campaigns. When every pixel matters, this is your go-to model.",
    highlights: ["Best detail", "Photorealistic", "Premium campaigns"],
  },
];

function ModelsBenefits() {
  return (
    <section className="bg-muted/30 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          badge="AI Models"
          title="The Right Model for the Job"
          description="Choose the generation model that fits your needs — from rapid prototyping to pixel-perfect output."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {models.map((m) => (
            <Card key={m.title} className="border shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {m.label}
                  </Badge>
                </div>
                <h3 className="mt-4 font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {m.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Why Us ─── */

const whyUs = [
  {
    icon: Clock,
    title: "Save Hours",
    description:
      "Skip expensive photoshoots and lengthy editing. Go from upload to finished images in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Boost Conversions",
    description:
      "Professional product images increase click-through rates by up to 40%. Quality visuals sell more.",
  },
  {
    icon: Cpu,
    title: "AI-Powered",
    description:
      "Built on fal.ai's infrastructure for reliable, high-quality generation that scales with your catalog.",
  },
];

function WhyUsBenefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          badge="Why Choose Us"
          title="Better Images, Less Effort"
          description="Everything you need to create professional product visuals at scale."
        />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {whyUs.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Combined Export ─── */

export function BenefitsSection() {
  return (
    <>
      <ImageStylesBenefits />
      <OccasionsBenefits />
      <ModelsBenefits />
      <WhyUsBenefits />
    </>
  );
}
