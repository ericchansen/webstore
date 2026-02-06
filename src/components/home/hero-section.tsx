import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { storeConfig } from "@/config/store";

export function HeroSection() {
  const { hero } = storeConfig;

  return (
    <section data-testid="hero-section" className="relative overflow-hidden bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid min-h-[500px] items-center gap-8 py-12 md:min-h-[600px] lg:grid-cols-2 lg:py-20">
          {/* Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 data-testid="hero-title" className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p data-testid="hero-subtitle" className="mt-4 max-w-md text-lg text-muted-foreground md:text-xl">
              {hero.subtitle}
            </p>
            <Button asChild size="lg" className="mt-8" data-testid="hero-cta">
              <Link href={hero.ctaLink}>{hero.ctaText}</Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative aspect-square lg:aspect-[4/3]">
            <Image
              src={hero.imageUrl}
              alt={storeConfig.name}
              fill
              className="rounded-lg object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
