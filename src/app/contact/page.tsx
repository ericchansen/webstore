import { storeConfig } from "@/config/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: `Contact Us | ${storeConfig.name}`,
  description: `Get in touch with ${storeConfig.name}. We'd love to hear from you.`,
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold">Contact Us</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Have a question about your order, or just want to say hello? We&apos;d
          love to hear from you.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${storeConfig.email}`}
                className="text-primary hover:underline"
              >
                {storeConfig.email}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`tel:${storeConfig.phone}`}
                className="text-primary hover:underline"
              >
                {storeConfig.phone}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Mon&ndash;Fri, 9am&ndash;5pm EST
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Visit Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cocoa &amp; Co. Kitchen<br />
                Brooklyn, NY
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our kitchen is open for tours by appointment only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
