import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { storeConfig } from "@/config/store";

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat(storeConfig.currency.locale, {
    style: "currency",
    currency: storeConfig.currency.code,
  }).format(price);
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber: id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. We&apos;ve sent a confirmation to{" "}
            <span className="font-medium text-foreground">{order.email}</span>
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Details</CardTitle>
              <span className="text-sm font-mono text-muted-foreground">
                #{order.orderNumber}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatPrice(Number(item.productPrice))}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(Number(item.total))}</p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shippingCost) === 0
                    ? "Free"
                    : formatPrice(Number(order.shippingCost))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPrice(Number(order.tax))}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
              <p>{order.shippingCountry}</p>
            </address>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              What&apos;s Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              1. You&apos;ll receive an email confirmation at {order.email}
            </p>
            <p>
              2. We&apos;ll prepare your order and ship it within 1-2 business days
            </p>
            <p>
              3. You&apos;ll receive tracking information once your order ships
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
