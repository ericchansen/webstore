import { storeConfig } from "@/config/store";
import { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact | ${storeConfig.name}`,
  description: `Get in touch with ${storeConfig.name}. We'd love to hear from you.`,
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="mt-4 text-muted-foreground">
          Have a question or need help with your order? We&apos;d love to hear
          from you.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <a
              href={`mailto:${storeConfig.email}`}
              className="text-primary hover:underline"
            >
              {storeConfig.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{storeConfig.phone}</span>
          </div>
        </div>
        <div className="mt-8 rounded-lg border bg-muted/40 p-6">
          <h2 className="font-semibold">Business Hours</h2>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <p>Monday &ndash; Friday: 9am &ndash; 6pm EST</p>
            <p>Saturday: 10am &ndash; 4pm EST</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
