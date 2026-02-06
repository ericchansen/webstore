"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart";
import { storeConfig } from "@/config/store";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string | null;
  inStock: boolean;
  featured?: boolean;
  categoryName?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat(storeConfig.currency.locale, {
    style: "currency",
    currency: storeConfig.currency.code,
  }).format(price);
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  inStock,
  featured,
  categoryName,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    addItem({
      productId: id,
      name,
      price,
      imageUrl,
    });
  };

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <Card data-testid="product-card" className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/products/${slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {featured && <Badge variant="secondary">Featured</Badge>}
            {discount && <Badge variant="destructive">-{discount}%</Badge>}
            {!inStock && <Badge variant="outline">Out of Stock</Badge>}
          </div>
        </div>

        <CardContent className="p-4">
          {categoryName && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {categoryName}
            </p>
          )}
          <h3 data-testid="product-name" className="mt-1 font-semibold leading-tight line-clamp-2">
            {name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span data-testid="product-price" className="font-bold">{formatPrice(price)}</span>
            {compareAtPrice && (
              <span data-testid="compare-at-price" className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0">
        <Button
          data-testid="add-to-cart"
          className="w-full"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
