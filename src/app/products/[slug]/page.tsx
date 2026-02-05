import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/product";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} | Cocoa & Co.`,
    description: product.description || `Shop ${product.name}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      inStock: true,
    },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </nav>

      {/* Product Detail */}
      <ProductDetail
        id={product.id}
        name={product.name}
        description={product.description}
        price={Number(product.price)}
        compareAtPrice={
          product.compareAtPrice ? Number(product.compareAtPrice) : null
        }
        imageUrl={product.imageUrl}
        images={product.images}
        inStock={product.inStock}
        stockCount={product.stockCount}
        categoryName={product.category.name}
        metadata={product.metadata as Record<string, unknown> | null}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold">You May Also Like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                id={related.id}
                name={related.name}
                slug={related.slug}
                price={Number(related.price)}
                compareAtPrice={
                  related.compareAtPrice
                    ? Number(related.compareAtPrice)
                    : null
                }
                imageUrl={related.imageUrl}
                inStock={related.inStock}
                categoryName={related.category.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
