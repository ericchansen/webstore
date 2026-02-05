"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProduct, updateProduct } from "@/lib/admin/actions";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  stockCount: number;
  featured: boolean;
  categoryId: string;
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product | null;
}) {
  const isEdit = !!product;
  const action = isEdit
    ? updateProduct.bind(null, product.id)
    : createProduct;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Product" : "Create Product"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update product information"
            : "Add a new product to your catalog"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                name="categoryId"
                defaultValue={product?.categoryId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description || ""}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
              <Input
                id="compareAtPrice"
                name="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.compareAtPrice || ""}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockCount">Stock Count</Label>
              <Input
                id="stockCount"
                name="stockCount"
                type="number"
                min="0"
                defaultValue={product?.stockCount || 0}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={product?.imageUrl || ""}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={product?.featured}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="featured">Featured product</Label>
          </div>

          <div className="flex gap-4">
            <Button type="submit">
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/admin/products">Cancel</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
