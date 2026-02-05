import Link from "next/link";
import { storeConfig } from "@/config/store";

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Truffles", href: "/products?category=truffles" },
    { name: "Chocolate Bars", href: "/products?category=chocolate-bars" },
    { name: "Gift Boxes", href: "/products?category=gift-boxes" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold">{storeConfig.name}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {storeConfig.footer.about}
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>{storeConfig.email}</p>
              <p>{storeConfig.phone}</p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold">Shop</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-3 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          {storeConfig.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
