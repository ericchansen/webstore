import { storeConfig } from "@/config/store";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: `About Us | ${storeConfig.name}`,
  description: `Learn about ${storeConfig.name} and our passion for artisan chocolates.`,
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold">About Us</h1>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold">Our Story</h2>
            <p className="mb-4 text-muted-foreground">
              {storeConfig.footer.about}
            </p>
            <p className="text-muted-foreground">
              We believe that great chocolate starts with great ingredients.
              That&apos;s why we source our cacao directly from farmers who share
              our commitment to quality and sustainability. Every bar, truffle,
              and confection is crafted by hand in small batches to ensure the
              perfect balance of flavor and texture.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-2xl font-semibold">Our Values</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">Ethically Sourced</strong> &mdash;
                Direct trade relationships with cacao farmers ensure fair wages
                and sustainable practices.
              </li>
              <li>
                <strong className="text-foreground">Handcrafted Quality</strong> &mdash;
                Every piece is made by hand in small batches using traditional
                techniques.
              </li>
              <li>
                <strong className="text-foreground">Fresh &amp; Natural</strong> &mdash;
                No artificial preservatives or flavors. Just pure, premium
                ingredients.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
