import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { getCategory } from "@/lib/admin/queries";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  );
}
