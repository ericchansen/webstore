import { storeConfig } from "@/config/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, Thermometer } from "lucide-react";

export const metadata = {
  title: `Shipping Policy | ${storeConfig.name}`,
  description: `Shipping information and delivery details for ${storeConfig.name}.`,
};

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold">Shipping</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          We take great care to ensure your chocolates arrive in perfect
          condition.
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Standard Shipping</strong>{" "}
                (3&ndash;5 business days) &mdash; $5.99
              </p>
              <p>
                <strong className="text-foreground">Free Shipping</strong> on
                orders over $50.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Temperature-Controlled Packaging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All orders are shipped with insulated packaging and ice packs
                during warmer months to keep your chocolates at the ideal
                temperature throughout transit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Orders are processed within 1&ndash;2 business days. You&apos;ll
                receive a tracking number via email once your order ships.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
