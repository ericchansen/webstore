import { ProductCard } from "@/components/product";
import type { Product, Category } from "@/generated/prisma/client";

type ProductWithCategory = Product & {
  category: Category;
};

interface FeaturedProductsProps {
  products: ProductWithCategory[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Featured Collection</h2>
          <p className="mt-2 text-muted-foreground">
            Our most popular handcrafted chocolates
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}
