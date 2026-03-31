import { storeConfig } from "@/config/store";
import { Metadata } from "next";
import { RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: `Returns | ${storeConfig.name}`,
  description: `Return policy for ${storeConfig.name} orders.`,
};

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-7 w-7" />
          <h1 className="text-3xl font-bold">Returns &amp; Refunds</h1>
        </div>
        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold">Satisfaction Guarantee</h2>
            <p className="mt-2 text-muted-foreground">
              We stand behind the quality of our products. If you&apos;re not
              completely satisfied with your purchase, we&apos;re here to help.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Return Policy</h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Returns accepted within 14 days of delivery</li>
              <li>Items must be unopened and in original packaging</li>
              <li>Damaged or defective items are replaced at no cost</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">How to Request a Return</h2>
            <p className="mt-2 text-muted-foreground">
              Contact us at{" "}
              <a
                href={`mailto:${storeConfig.email}`}
                className="text-primary hover:underline"
              >
                {storeConfig.email}
              </a>{" "}
              with your order number and reason for return. We&apos;ll respond
              within one business day with a prepaid return label.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
