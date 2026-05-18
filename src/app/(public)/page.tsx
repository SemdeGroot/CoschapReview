import { ArrowRight } from "lucide-react";

import { PublicCourseOverview } from "@/components/public-course-overview";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PublicCourseOverview />
    </>
  );
}

function HeroSection() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
      <div className="site-gutter mx-auto w-full max-w-6xl py-16 sm:py-24">
        <h1 className="animate-fade-up max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Kies je coschap op basis van echte ervaringen.
        </h1>
        <p className="animate-fade-up-d1 mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Beoordelingen door studenten die zelf meegelopen hebben in
          openbare, ziekenhuis- en poliklinische apotheken.
        </p>
        <div className="animate-fade-up-d2 mt-8 flex flex-wrap items-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href="#coschappen">
              Bekijk coschappen <ArrowRight size={16} />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
