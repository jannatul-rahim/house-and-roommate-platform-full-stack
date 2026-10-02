import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/shared/section-heading";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the NestMate team about renting, listing your property, payments or roommate matching.",
  openGraph: { title: "Contact NestMate", description: "Questions about renting, listing or payments? We're here to help." },
};

const channels = [
  { icon: Mail, label: "Email", value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
  { icon: Phone, label: "Phone", value: "+880 1700-000000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Office", value: "Gulshan Avenue, Dhaka 1212" },
  { icon: Clock, label: "Hours", value: "Sat–Thu, 9am – 7pm" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="We'd love to hear from you" description="Questions about a listing, a payment or how NestMate works? Send us a message and we'll reply within one business day." />
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {channels.map((c) => (
            <div key={c.label} className="flex items-start gap-4 rounded-2xl border bg-card p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {c.href ? (
                  <a href={c.href} className="font-semibold hover:text-primary">
                    {c.value}
                  </a>
                ) : (
                  <p className="font-semibold">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </>
  );
}
