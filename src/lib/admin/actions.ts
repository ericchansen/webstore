"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  validateCredentials,
  createSession,
  destroySession,
  requireAuth,
} from "./auth";
import type { OrderStatus } from "@/generated/prisma/client";

// ============================================================================
// AUTH ACTIONS
// ============================================================================

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const valid = await validateCredentials(username, password);
  if (!valid) {
    return { error: "Invalid credentials" };
  }

  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

export async function createProduct(formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const compareAtPrice = formData.get("compareAtPrice")
    ? parseFloat(formData.get("compareAtPrice") as string)
    : null;
  const categoryId = formData.get("categoryId") as string;
  const stockCount = parseInt(formData.get("stockCount") as string) || 0;
  const imageUrl = formData.get("imageUrl") as string;
  const featured = formData.get("featured") === "on";

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await prisma.product.create({
    data: {
      name,
      slug: `${slug}-${Date.now()}`,
      description,
      price,
      compareAtPrice,
      categoryId,
      stockCount,
      inStock: stockCount > 0,
      imageUrl: imageUrl || null,
      featured,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const compareAtPrice = formData.get("compareAtPrice")
    ? parseFloat(formData.get("compareAtPrice") as string)
    : null;
  const categoryId = formData.get("categoryId") as string;
  const stockCount = parseInt(formData.get("stockCount") as string) || 0;
  const imageUrl = formData.get("imageUrl") as string;
  const featured = formData.get("featured") === "on";

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      compareAtPrice,
      categoryId,
      stockCount,
      inStock: stockCount > 0,
      imageUrl: imageUrl || null,
      featured,
    },
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAuth();

  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
}

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

export async function createCategory(formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await prisma.category.create({
    data: {
      name,
      slug: `${slug}-${Date.now()}`,
      description: description || null,
      imageUrl: imageUrl || null,
      sortOrder,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  await prisma.category.update({
    where: { id },
    data: {
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      sortOrder,
    },
  });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAuth();

  // Check if category has products
  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    throw new Error("Cannot delete category with products");
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAuth();

  await prisma.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
}

// ============================================================================
// INVENTORY ACTIONS
// ============================================================================

export async function updateStock(id: string, stockCount: number) {
  await requireAuth();

  await prisma.product.update({
    where: { id },
    data: {
      stockCount,
      inStock: stockCount > 0,
    },
  });

  revalidatePath("/admin/inventory");
}
