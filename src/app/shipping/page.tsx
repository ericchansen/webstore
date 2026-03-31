import { storeConfig } from "@/config/store";
import { Metadata } from "next";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: `Shipping | ${storeConfig.name}`,
  description: `Shipping information for ${storeConfig.name} orders.`,
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <Truck className="h-7 w-7" />
          <h1 className="text-3xl font-bold">Shipping Information</h1>
        </div>
        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold">Delivery Times</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Standard Shipping: 5&ndash;7 business days</li>
              <li>Express Shipping: 2&ndash;3 business days</li>
              <li>Overnight Shipping: Next business day</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Temperature-Controlled Packaging</h2>
            <p className="mt-2 text-muted-foreground">
              All orders are shipped in insulated packaging with ice packs
              during warmer months to ensure your chocolates arrive in
              perfect condition.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Free Shipping</h2>
            <p className="mt-2 text-muted-foreground">
              Enjoy free standard shipping on all orders over $50.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
