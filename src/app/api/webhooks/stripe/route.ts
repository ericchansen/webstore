import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

function getStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
  });
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CC-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripeInstance();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { metadata } = paymentIntent;
  
  if (!metadata.email) {
    console.error("No email in payment intent metadata");
    return;
  }

  // Check if order already exists for this payment intent
  const existingOrder = await prisma.order.findFirst({
    where: { paymentIntentId: paymentIntent.id },
  });

  if (existingOrder) {
    // Update existing order to succeeded
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: "SUCCEEDED",
        status: "CONFIRMED",
      },
    });
    console.log(`Updated order ${existingOrder.orderNumber} to SUCCEEDED`);
    return;
  }

  // Parse items from metadata
  let items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }> = [];
  
  try {
    items = JSON.parse(metadata.items || "[]");
  } catch (err) {
    console.error("Failed to parse items from metadata:", err);
    return;
  }

  // Create order from payment intent
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      email: metadata.email,
      shippingName: metadata.shippingName || "Customer",
      shippingAddress: metadata.shippingAddress || "",
      shippingCity: metadata.shippingCity || "",
      shippingState: metadata.shippingState || "",
      shippingZip: metadata.shippingZip || "",
      shippingCountry: "US",
      subtotal: parseFloat(metadata.subtotal || "0"),
      shippingCost: parseFloat(metadata.shippingCost || "0"),
      tax: parseFloat(metadata.tax || "0"),
      total: parseFloat(metadata.total || "0"),
      paymentIntentId: paymentIntent.id,
      paymentStatus: "SUCCEEDED",
      status: "CONFIRMED",
      items: {
        create: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          productPrice: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
      },
    },
  });

  console.log(`Created order ${order.orderNumber} for payment ${paymentIntent.id}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  // Check if order exists and update it to failed
  const existingOrder = await prisma.order.findFirst({
    where: { paymentIntentId: paymentIntent.id },
  });

  if (existingOrder) {
    await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: "FAILED",
      },
    });
    console.log(`Updated order ${existingOrder.orderNumber} to FAILED`);
  } else {
    console.log(`Payment failed for intent ${paymentIntent.id}, no order to update`);
  }
}
