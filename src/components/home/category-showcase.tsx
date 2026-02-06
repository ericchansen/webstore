import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { Category } from "@/generated/prisma/client";

interface CategoryShowcaseProps {
  categories: Category[];
}

// Placeholder images for categories without images
const categoryImages: Record<string, string> = {
  truffles: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400",
  "chocolate-bars":
    "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400",
  "gift-boxes":
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400",
  "hot-chocolate":
    "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
  seasonal:
    "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400",
};

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (categories.length === 0) return null;

  return (
    <section data-testid="categories-section" className="bg-muted/50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find the perfect chocolate for every taste
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              data-testid="category-card"
            >
              <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-square">
                  <Image
                    src={
                      category.imageUrl || categoryImages[category.slug] || ""
                    }
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <CardContent className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
