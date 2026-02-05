import { prisma } from "@/lib/prisma";
import {
  HeroSection,
  FeatureHighlights,
  FeaturedProducts,
  CategoryShowcase,
} from "@/components/home";

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic";

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, inStock: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <HeroSection />
      <FeatureHighlights />
      <FeaturedProducts products={featuredProducts} />
      <CategoryShowcase categories={categories} />
    </>
  );
}
