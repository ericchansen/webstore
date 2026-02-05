import { Leaf, Award, Gift, Truck, type LucideIcon } from "lucide-react";
import { storeConfig } from "@/config/store";

const iconMap: Record<string, LucideIcon> = {
  leaf: Leaf,
  award: Award,
  gift: Gift,
  truck: Truck,
};

export function FeatureHighlights() {
  return (
    <section className="border-y bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {storeConfig.features.map((feature) => {
            const Icon = iconMap[feature.icon] || Gift;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
