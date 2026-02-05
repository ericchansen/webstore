"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createCategory, updateCategory } from "@/lib/admin/actions";

type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};

export function CategoryForm({ category }: { category?: Category | null }) {
  const isEdit = !!category;
  const action = isEdit
    ? updateCategory.bind(null, category.id)
    : createCategory;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Category" : "Create Category"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update category information"
            : "Add a new category to organize your products"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              required
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description || ""}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                defaultValue={category?.imageUrl || ""}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={category?.sortOrder || 0}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit">
              {isEdit ? "Update Category" : "Create Category"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href="/admin/categories">Cancel</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
