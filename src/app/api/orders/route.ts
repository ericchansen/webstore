import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { prisma } from "@/lib/prisma";

const tracer = trace.getTracer("webstore");

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderRequest {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("POST /api/orders", (span) => {
    span.setAttribute("http.route", "/api/orders");
    return handlePost(request, span);
  });
}

async function handlePost(
  request: NextRequest,
  span: import("@opentelemetry/api").Span
) {
  try {
    // Demo failure mode — when enabled, checkout fails with a realistic
    // service error while the rest of the site stays healthy.
    // Toggle via: DEMO_BROKEN_CHECKOUT=true on the Container App.
    if (process.env.DEMO_BROKEN_CHECKOUT === "true") {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const error = new Error(
        "PaymentGatewayConnectionRefused: downstream payment gateway connection refused"
      );

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "checkout_failure",
      });
      span.recordException(error);
      span.setAttribute("error.type", "PaymentGatewayConnectionRefused");
      span.setAttribute("http.status_code", 503);
      span.setAttribute("demo.broken_checkout", true);
      span.addEvent("checkout_failure", {
        "failure.reason": "downstream payment gateway connection refused",
        "failure.component": "OrderService",
      });

      console.error(
        "OrderService: Failed to process order — downstream payment gateway connection refused",
        {
          timestamp: new Date().toISOString(),
          path: "/api/orders",
          method: "POST",
          demo: true,
        }
      );
      span.end();
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    const body: CreateOrderRequest = await request.json();

    // Basic validation
    if (!body.email || !body.firstName || !body.lastName || !body.address) {
      span.setAttribute("http.status_code", 400);
      span.end();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      span.setAttribute("http.status_code", 400);
      span.end();
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    // Validate that all product IDs exist before attempting order creation.
    // This prevents Prisma P2003 foreign key constraint violations on
    // OrderItem_productId_fkey when carts contain stale or deleted product IDs.
    const requestedProductIds = body.items.map((item) => item.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: requestedProductIds } },
      select: { id: true },
    });
    const existingProductIds = new Set(existingProducts.map((p) => p.id));
    const invalidProductIds = requestedProductIds.filter(
      (id) => !existingProductIds.has(id)
    );

    if (invalidProductIds.length > 0) {
      span.setAttribute("http.status_code", 400);
      span.setAttribute("order.invalid_product_ids", invalidProductIds.join(","));
      span.addEvent("order_validation_failed", {
        "validation.reason": "invalid_product_ids",
        "validation.invalid_ids": invalidProductIds.join(","),
      });
      span.end();
      return NextResponse.json(
        {
          error:
            "Some items in your cart are no longer available. Please refresh your cart and try again.",
          invalidProductIds,
        },
        { status: 400 }
      );
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        email: body.email,
        phone: body.phone || null,
        shippingName: `${body.firstName} ${body.lastName}`,
        shippingAddress: body.address,
        shippingCity: body.city,
        shippingState: body.state,
        shippingZip: body.zip,
        shippingCountry: "US",
        subtotal: body.subtotal,
        shippingCost: body.shippingCost,
        tax: body.tax,
        total: body.total,
        items: {
          create: body.items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productPrice: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    span.setAttribute("http.status_code", 201);
    span.setAttribute("order.number", order.orderNumber);
    span.setAttribute("order.item_count", order.items.length);
    span.end();
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: "order_creation_failed" });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    span.setAttribute("http.status_code", 500);
    span.end();
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
