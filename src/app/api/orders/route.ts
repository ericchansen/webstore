import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    // Demo failure mode — when enabled, checkout fails with a realistic
    // service error while the rest of the site stays healthy.
    // Toggle via: DEMO_BROKEN_CHECKOUT=true on the Container App.
    if (process.env.DEMO_BROKEN_CHECKOUT === "true") {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.error(
        "OrderService: Failed to process order — downstream payment gateway connection refused",
        {
          timestamp: new Date().toISOString(),
          path: "/api/orders",
          method: "POST",
          demo: true,
        }
      );
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }

    const body: CreateOrderRequest = await request.json();

    // Basic validation
    if (!body.email || !body.firstName || !body.lastName || !body.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
