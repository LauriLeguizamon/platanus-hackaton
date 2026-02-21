import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <HowItWorks />
      <BenefitsSection />
      <CtaSection />
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Powered by fal.ai
      </footer>
    </div>
  );
}
