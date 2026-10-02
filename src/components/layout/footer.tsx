import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "Find a room" },
      { href: "/services", label: "Services" },
      { href: "/register", label: "List your property" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Rooms, leases, rent and roommates — managed in one place for tenants and property owners across Bangladesh.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden /> Gulshan Avenue, Dhaka 1212
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-primary" aria-hidden /> {siteConfig.supportEmail}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-primary" aria-hidden /> +880 1700-000000
            </li>
          </ul>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p>Payments are processed securely by Stripe.</p>
        </div>
      </div>
    </footer>
  );
}
