"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart";
import { storeConfig } from "@/config/store";
import { toast } from "sonner";
import { StripeProvider, PaymentForm } from "@/components/checkout";

function formatPrice(price: number): string {
  return new Intl.NumberFormat(storeConfig.currency.locale, {
    style: "currency",
    currency: storeConfig.currency.code,
  }).format(price);
}

interface ShippingFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

type CheckoutStep = "shipping" | "payment";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isLoading } = useCart();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentIntentData | null>(null);
  const [formData, setFormData] = useState<ShippingFormData>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const shippingCost = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPaymentIntent(true);

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          email: formData.email,
          shippingName: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingState: formData.state,
          shippingZip: formData.zip,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data: PaymentIntentData = await response.json();
      setPaymentData(data);
      setStep("payment");
    } catch {
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = useCallback(
    async (paymentIntentId: string) => {
      // Create order in database
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            items: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            subtotal: paymentData?.subtotal ?? subtotal,
            shippingCost: paymentData?.shippingCost ?? shippingCost,
            tax: paymentData?.tax ?? tax,
            total: paymentData?.total ?? total,
            paymentIntentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }

        const order = await response.json();
        clearCart();
        router.push(`/orders/${order.orderNumber}/confirmation`);
      } catch {
        toast.error("Payment succeeded but order creation failed. Please contact support.");
      }
    },
    [formData, items, paymentData, subtotal, shippingCost, tax, total, clearCart, router]
  );

  const handlePaymentError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground">
            Add some items to checkout
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/cart" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Cart
        </Link>
      </Button>

      <h1 className="text-3xl font-bold">Checkout</h1>

      {/* Progress indicator */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className={step === "shipping" ? "font-semibold text-primary" : "text-muted-foreground"}>
          1. Shipping
        </span>
        <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
        <span className={step === "payment" ? "font-semibold text-primary" : "text-muted-foreground"}>
          2. Payment
        </span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <div className="space-y-6 lg:col-span-2">
          {step === "shipping" ? (
            <form onSubmit={handleContinueToPayment}>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="mt-6 w-full"
                disabled={isCreatingPaymentIntent}
                data-testid="place-order-button"
              >
                {isCreatingPaymentIntent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Payment...
                  </>
                ) : (
                  "Continue to Payment"
                )}
              </Button>
            </form>
          ) : (
            <>
              {/* Shipping Summary */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Shipping Information</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("shipping")}
                    className="text-primary"
                  >
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  <p className="text-muted-foreground">{formData.email}</p>
                  <p className="mt-2 text-muted-foreground">
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zip}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentData?.clientSecret ? (
                    <StripeProvider clientSecret={paymentData.clientSecret}>
                      <PaymentForm
                        orderId={paymentData.paymentIntentId}
                        total={paymentData.total}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </StripeProvider>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24" data-testid="order-summary">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Preview */}
              <div className="max-h-48 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3" data-testid="order-item">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between" data-testid="checkout-subtotal">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between" data-testid="checkout-shipping">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0
                      ? "Free"
                      : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between" data-testid="checkout-tax">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold" data-testid="checkout-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {shippingCost === 0 && (
                <p className="text-center text-sm text-green-600">
                  ✓ You qualify for free shipping!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
