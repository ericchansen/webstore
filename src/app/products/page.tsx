import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export const metadata = {
  title: "Shop All Products | Cocoa & Co.",
  description: "Browse our complete collection of artisan chocolates.",
};

async function ProductGrid({ category }: { category?: string }) {
  const products = await prisma.product.findMany({
    where: category
      ? {
          category: { slug: category },
        }
      : undefined,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  if (products.length === 0) {
    return (
      <div data-testid="no-results" className="text-center py-12">
        <p className="text-muted-foreground">No products found.</p>
        <Button asChild className="mt-4">
          <Link href="/products">View All Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="product-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          slug={product.slug}
          price={Number(product.price)}
          compareAtPrice={
            product.compareAtPrice ? Number(product.compareAtPrice) : null
          }
          imageUrl={product.imageUrl}
          inStock={product.inStock}
          featured={product.featured}
          categoryName={product.category.name}
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

async function CategoryFilter({ currentCategory }: { currentCategory?: string }) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        asChild
        variant={!currentCategory ? "default" : "outline"}
        size="sm"
      >
        <Link href="/products">All</Link>
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          asChild
          variant={currentCategory === cat.slug ? "default" : "outline"}
          size="sm"
        >
          <Link href={`/products?category=${cat.slug}`}>{cat.name}</Link>
        </Button>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;

  // Get category name for heading
  let categoryName = "All Products";
  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (cat) {
      categoryName = cat.name;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{categoryName}</h1>
        <p className="mt-2 text-muted-foreground">
          Discover our handcrafted selection of premium chocolates
        </p>
      </div>

      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-9 w-full max-w-md" />}>
          <CategoryFilter currentCategory={category} />
        </Suspense>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid category={category} />
      </Suspense>
    </div>
  );
}
