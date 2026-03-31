import { storeConfig } from "@/config/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";

export const metadata = {
  title: `Returns & Refunds | ${storeConfig.name}`,
  description: `Return policy and refund information for ${storeConfig.name}.`,
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold">Returns &amp; Refunds</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Your satisfaction is our top priority. If something isn&apos;t right
          with your order, we&apos;re here to help.
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Our Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If your chocolates arrive damaged or are not up to our quality
                standards, we&apos;ll replace them or issue a full refund &mdash;
                no questions asked.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Return Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Due to the perishable nature of our products, we cannot accept
                returns for change of mind. However, we will gladly issue a
                refund or replacement if:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Your order arrived damaged</li>
                <li>You received the wrong items</li>
                <li>The product quality does not meet expectations</li>
              </ul>
              <p>
                Please contact us within 7 days of delivery with photos of the
                issue.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                How to Request a Refund
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Email us at{" "}
                <a
                  href={`mailto:${storeConfig.email}`}
                  className="text-primary hover:underline"
                >
                  {storeConfig.email}
                </a>{" "}
                with your order number and a description of the issue. We aim to
                resolve all requests within 48 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
