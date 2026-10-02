import {
  BarChart3,
  BellRing,
  Building2,
  CalendarCheck,
  CreditCard,
  FileSignature,
  HeartHandshake,
  ReceiptText,
  ScrollText,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Services",
  description: "Everything NestMate does for tenants, property owners and administrators — from search and viewings to Stripe rent, bills, maintenance and analytics.",
  openGraph: { title: "NestMate services", description: "Search, viewings, leases, Stripe rent, bills, maintenance, roommate matching and analytics." },
};

const groups = [
  {
    title: "For tenants",
    description: "Find, book and live — without the paperwork.",
    services: [
      { icon: Search, title: "Smart room search", text: "Filter by city, type, budget and move-in date; results are shareable links." },
      { icon: CalendarCheck, title: "Viewing requests", text: "Book a slot inside each room's availability window and track the owner's reply." },
      { icon: FileSignature, title: "Applications & leases", text: "Apply in one click, attach your viewing, and receive a digital lease on approval." },
      { icon: CreditCard, title: "Online rent", text: "Pay monthly rent through Stripe Checkout with an automatic receipt history." },
      { icon: HeartHandshake, title: "Roommate matching", text: "A five-factor compatibility score with a transparent breakdown." },
      { icon: Wrench, title: "Maintenance tickets", text: "Report issues with a priority and follow them until they're closed." },
    ],
  },
  {
    title: "For property owners",
    description: "Run your rentals from one dashboard.",
    services: [
      { icon: Building2, title: "Guided listing wizard", text: "Property, building, unit, room and availability — set up in five steps." },
      { icon: BellRing, title: "Request inbox", text: "Approve or decline viewings and applications, then create leases instantly." },
      { icon: BarChart3, title: "Earnings analytics", text: "Monthly rent collected and per-property breakdowns from real Stripe payments." },
      { icon: ReceiptText, title: "Utility bill splitting", text: "Record electricity, gas, water or internet bills and split them per tenant." },
    ],
  },
  {
    title: "For administrators",
    description: "Keep the marketplace healthy and accountable.",
    services: [
      { icon: BarChart3, title: "Platform analytics", text: "Rent processed, application pipeline, inventory by city and maintenance load." },
      { icon: ShieldCheck, title: "Listing moderation", text: "Unpublish, archive or remove listings that break the rules." },
      { icon: ScrollText, title: "Audit trail", text: "An immutable log of approvals, leases, payments and deletions." },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="One platform for the entire rental journey" description="NestMate replaces scattered phone calls, cash receipts and spreadsheets with a single, role-aware workspace." />
      <div className="container-page space-y-20 py-20">
        {groups.map((group) => (
          <section key={group.title} className="space-y-8">
            <SectionHeading eyebrow={group.title} title={group.description} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.services.map((s) => (
                <div key={s.title} className="group rounded-2xl border bg-card p-6 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mb-1.5 font-heading text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="rounded-3xl border bg-muted/40 p-8 text-center sm:p-12">
          <h2 className="mb-3 font-heading text-2xl font-bold sm:text-3xl">See it with real data</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">Use a one-click demo account on the login page to explore the tenant, owner and admin workspaces.</p>
          <Button size="lg" className="h-11 px-6" asChild>
            <Link href="/login">Try a demo account</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
