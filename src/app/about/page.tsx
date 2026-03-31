import { storeConfig } from "@/config/store";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `About Us | ${storeConfig.name}`,
  description: `Learn about ${storeConfig.name} and our passion for artisan chocolates.`,
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">About Us</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>{storeConfig.footer.about}</p>
          <p>
            We believe that great chocolate starts with great ingredients.
            That&apos;s why we source our cacao directly from farmers who share
            our commitment to quality and sustainability.
          </p>
          <p>
            Every piece is handcrafted in small batches to ensure the
            perfect balance of flavor and texture. From our classic truffles
            to our seasonal collections, we pour our heart into everything
            we make.
          </p>
        </div>
      </div>
    </div>
  );
}
