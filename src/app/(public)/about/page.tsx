import { HeartHandshake, Lock, Scale, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getMarketSnapshot } from "@/lib/data/properties";
import { formatCurrency } from "@/lib/format";
import { marketingPhotos } from "@/lib/property-media";

export const metadata: Metadata = {
  title: "About us",
  description: "NestMate makes renting a room and finding a compatible roommate in Bangladesh transparent, safe and fast.",
  openGraph: { title: "About NestMate", description: "Our mission: transparent, safe and fast room rentals and roommate matching." },
};

const values = [
  { icon: Scale, title: "Transparency first", text: "Rent, deposit and availability are shown up front. Every request has a visible status from pending to approved." },
  { icon: Lock, title: "Safe by design", text: "Role-based access, server-side session handling and Stripe-hosted card payments — we never touch card numbers." },
  { icon: HeartHandshake, title: "People over listings", text: "A great room with the wrong flatmate isn't a great home. Our compatibility score explains every match." },
  { icon: Sparkles, title: "Less admin for owners", text: "Requests, leases, bills and maintenance live in one inbox, so owners spend minutes — not evenings — managing tenants." },
];

export default async function AboutPage() {
  const snapshot = await getMarketSnapshot().catch(() => null);

  return (
    <>
      <PageHero
        eyebrow="About NestMate"
        title="Renting a room should feel like coming home — not a negotiation"
        description="We built NestMate for the millions of students and young professionals who share homes across Bangladesh, and for the owners who host them."
      />

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="space-y-5">
          <SectionHeading eyebrow="Our story" title="From phone calls and paper receipts to one shared timeline" />
          <p className="text-muted-foreground">
            Finding a room in Dhaka used to mean calling dozens of numbers, visiting flats that were already taken and
            paying rent in cash with no record. Owners juggled the same chaos from the other side.
          </p>
          <p className="text-muted-foreground">
            NestMate puts the whole rental journey in one place: listings with real availability, viewing requests,
            applications, digital leases, online rent through Stripe, utility bill splitting and maintenance tracking —
            plus roommate matching for people who want to choose who they live with.
          </p>
          <dl className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <dt className="text-xs text-muted-foreground">Live listings</dt>
              <dd className="font-heading text-2xl font-bold">{snapshot?.totalProperties ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cities</dt>
              <dd className="font-heading text-2xl font-bold">{snapshot?.cities.length ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Rent from</dt>
              <dd className="font-heading text-2xl font-bold">{snapshot?.lowestRent ? formatCurrency(snapshot.lowestRent) : "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
          <Image src={marketingPhotos.about} alt="A calm, sunlit shared living space" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container-page space-y-12">
          <SectionHeading center eyebrow="What we believe" title="Four principles behind every feature" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-card p-6 shadow-xs">
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mb-2 font-heading text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-5">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Ready to find your nest?</h2>
          <p className="text-muted-foreground">Browse rooms without an account, or sign up to book viewings and meet roommates.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6" asChild>
              <Link href="/properties">Browse rooms</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
