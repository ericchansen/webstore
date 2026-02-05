import prisma from "@/lib/prisma";

export async function getAnalytics() {
  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCategories,
    revenueResult,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.product.count(),
    prisma.product.count({ where: { stockCount: { lte: 10, gt: 0 } } }),
    prisma.product.count({ where: { stockCount: 0 } }),
    prisma.category.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "SUCCEEDED" },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        email: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCategories,
    totalRevenue: revenueResult._sum.total?.toNumber() || 0,
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalQuantity: p._sum.quantity || 0,
      totalRevenue: p._sum.total?.toNumber() || 0,
    })),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      total: o.total.toNumber(),
    })),
  };
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    compareAtPrice: p.compareAtPrice?.toNumber() || null,
  }));
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) return null;

  return {
    ...product,
    price: product.price.toNumber(),
    compareAtPrice: product.compareAtPrice?.toNumber() || null,
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategory(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    ...o,
    subtotal: o.subtotal.toNumber(),
    shippingCost: o.shippingCost.toNumber(),
    tax: o.tax.toNumber(),
    total: o.total.toNumber(),
    items: o.items.map((i) => ({
      ...i,
      productPrice: i.productPrice.toNumber(),
      total: i.total.toNumber(),
    })),
  }));
}

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: order.subtotal.toNumber(),
    shippingCost: order.shippingCost.toNumber(),
    tax: order.tax.toNumber(),
    total: order.total.toNumber(),
    items: order.items.map((i) => ({
      ...i,
      productPrice: i.productPrice.toNumber(),
      total: i.total.toNumber(),
    })),
  };
}

export async function getInventory() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      stockCount: true,
      inStock: true,
      category: { select: { name: true } },
    },
    orderBy: { stockCount: "asc" },
  });

  return products.map((p) => ({
    ...p,
    status:
      p.stockCount === 0
        ? "out_of_stock"
        : p.stockCount <= 10
          ? "low_stock"
          : "in_stock",
  }));
}
