"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart";
import { storeConfig } from "@/config/store";

interface ProductDetailProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string | null;
  images?: string[];
  inStock: boolean;
  stockCount: number;
  categoryName: string;
  metadata?: Record<string, unknown> | null;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat(storeConfig.currency.locale, {
    style: "currency",
    currency: storeConfig.currency.code,
  }).format(price);
}

export function ProductDetail({
  id,
  name,
  description,
  price,
  compareAtPrice,
  imageUrl,
  images = [],
  inStock,
  stockCount,
  categoryName,
  metadata,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(imageUrl);
  const { addItem } = useCart();

  const allImages = imageUrl ? [imageUrl, ...images] : images;

  const handleAddToCart = () => {
    if (!inStock) return;

    addItem(
      {
        productId: id,
        name,
        price,
        imageUrl,
      },
      quantity
    );
    setQuantity(1);
  };

  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  // Extract dietary info from metadata if available
  const dietary = (metadata?.dietary as string[]) || [];
  const pieces = metadata?.pieces as number | undefined;
  const weight = metadata?.weight as string | undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Images */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                  selectedImage === img
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {categoryName}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{name}</h1>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">{formatPrice(price)}</span>
          {compareAtPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(compareAtPrice)}
              </span>
              <Badge variant="destructive">Save {discount}%</Badge>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {dietary.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
          {pieces && <Badge variant="outline">{pieces} pieces</Badge>}
          {weight && <Badge variant="outline">{weight}</Badge>}
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        )}

        {/* Stock Status */}
        <div>
          {inStock ? (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ In stock{stockCount <= 10 && ` – only ${stockCount} left`}
            </p>
          ) : (
            <p className="text-sm text-destructive">Out of stock</p>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!inStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
