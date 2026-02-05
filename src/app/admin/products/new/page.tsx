import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/admin/queries";

export default async function NewProductPage() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">New Product</h1>
        <p className="text-muted-foreground">
          You need to create at least one category before adding products.{" "}
          <a href="/admin/categories/new" className="text-primary underline">
            Create a category
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
