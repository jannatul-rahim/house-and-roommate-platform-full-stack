import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CreditCard,
  FileSignature,
  HeartHandshake,
  KeyRound,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { HeroSearch } from "@/components/property/hero-search";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { getMarketSnapshot } from "@/lib/data/properties";
import { formatCurrency } from "@/lib/format";
import { marketingPhotos } from "@/lib/property-media";

const steps = [
  {
    icon: MapPin,
    title: "Find a room",
    text: "Filter published listings by city, type, budget and move-in dates — every result shows live availability.",
  },
  {
    icon: CalendarCheck,
    title: "Book a viewing",
    text: "Pick a date inside the room's availability window. The owner approves or suggests another time.",
  },
  {
    icon: FileSignature,
    title: "Apply & sign",
    text: "Send an application in one click. Once approved, your lease is created with rent and deposit locked in.",
  },
  {
    icon: CreditCard,
    title: "Pay rent online",
    text: "Pay monthly rent through Stripe Checkout and keep a complete receipt history in your dashboard.",
  },
];

const audiences = [
  {
    icon: KeyRound,
    title: "For tenants",
    points: ["Viewings, applications and leases in one timeline", "Secure Stripe rent payments", "Roommate matching with compatibility scores"],
    href: "/register",
    cta: "Start renting",
  },
  {
    icon: Building2,
    title: "For property owners",
    points: ["Guided wizard to list buildings, units and rooms", "Approve viewings and applications fast", "Track earnings, bills and maintenance"],
    href: "/register",
    cta: "List a property",
  },
  {
    icon: ShieldCheck,
    title: "For administrators",
    points: ["Platform-wide analytics and charts", "Moderate listings and bookings", "Immutable audit trail of every action"],
    href: "/login",
    cta: "Admin sign in",
  },
];

const matchWeights = [
  { label: "Budget overlap", weight: 30 },
  { label: "Lifestyle (smoking, pets)", weight: 20 },
  { label: "Preferred location", weight: 20 },
  { label: "Move-in timing", weight: 15 },
  { label: "Shared preferences", weight: 15 },
];

export default async function HomePage() {
  const snapshot = await getMarketSnapshot().catch(() => null);
  const featured = snapshot?.properties.slice(0, 6) ?? [];

  const stats = [
    { label: "Published properties", value: snapshot?.totalProperties ?? "—" },
    { label: "Rooms available now", value: snapshot?.availableRooms ?? "—" },
    { label: "Cities covered", value: snapshot?.cities.length ?? "—" },
    { label: "Rent starting at", value: snapshot?.lowestRent ? formatCurrency(snapshot.lowestRent) : "—" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
        <div className="absolute -top-40 -right-40 -z-10 size-[32rem] rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="absolute top-40 -left-40 -z-10 size-96 rounded-full bg-amber-300/20 blur-3xl" aria-hidden />
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold text-primary shadow-xs">
              <Sparkles className="size-3.5" aria-hidden /> Rooms, leases and roommates in one place
            </span>
            <h1 className="font-heading text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find a room you love. <span className="text-primary">Live with people you like.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              NestMate connects tenants with verified property owners across Bangladesh — book viewings, sign leases,
              pay rent securely and match with compatible roommates.
            </p>
            <HeroSearch />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" aria-hidden /> Owner-verified listings
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" aria-hidden /> Stripe-secured rent
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="size-4 text-primary" aria-hidden /> Smart roommate matching
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 sm:aspect-[5/5]">
              <Image src={marketingPhotos.hero} alt="Bright shared living room with plants" fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 w-44 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:w-56">
              <div className="relative aspect-[4/3]">
                <Image src={marketingPhotos.heroSecondary} alt="Cosy apartment lounge" fill sizes="224px" className="object-cover" />
              </div>
            </div>
            <div className="absolute top-6 -right-2 rounded-2xl border bg-background/95 p-4 shadow-xl backdrop-blur sm:-right-6">
              <p className="text-xs text-muted-foreground">Rooms available now</p>
              <p className="font-heading text-2xl font-bold text-primary">{snapshot?.availableRooms ?? "—"}</p>
            </div>
            <div className="absolute right-4 -bottom-4 flex items-center gap-3 rounded-2xl border bg-background/95 p-3 shadow-xl backdrop-blur">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-600">
                <HeartHandshake className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">Roommate match</p>
                <p className="text-xs text-muted-foreground">Scored on 5 factors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section aria-label="Platform statistics" className="border-y bg-muted/30">
        <dl className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="font-heading text-3xl font-bold tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured listings */}
      <section className="container-page py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Fresh on NestMate</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Latest homes with open rooms</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/properties">
              Browse all listings <ArrowRight />
            </Link>
          </Button>
        </div>
        {featured.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, i) => (
              <PropertyCard key={property.id} property={property} priority={i < 3} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={snapshot ? "No listings published yet" : "Listings are temporarily unavailable"}
            description={
              snapshot
                ? "Property owners haven't published any homes yet. Check back soon or list your own."
                : "We couldn't reach the listings service. Please refresh in a moment."
            }
            action={
              <Button asChild>
                <Link href="/register">List your property</Link>
              </Button>
            }
          />
        )}
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">How it works</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">From search to keys in four steps</h2>
            <p className="text-muted-foreground">Every step happens inside NestMate, so nothing gets lost in phone calls or chat threads.</p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border bg-card p-6 shadow-xs">
                <span className="absolute top-5 right-5 font-heading text-4xl font-extrabold text-muted/80" aria-hidden>
                  0{i + 1}
                </span>
                <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mb-2 font-heading text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Audiences */}
      <section className="container-page py-20">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">Built for everyone in the rental</p>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">One platform, three workspaces</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.title} className="flex flex-col rounded-2xl border bg-card p-7 shadow-xs transition-shadow hover:shadow-lg">
              <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <a.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mb-4 font-heading text-xl font-semibold">{a.title}</h3>
              <ul className="mb-6 space-y-3">
                {a.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> {point}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-auto self-start" asChild>
                <Link href={a.href}>
                  {a.cta} <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Roommate matching */}
      <section className="bg-muted/30 py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src={marketingPhotos.roommates} alt="Shared apartment kitchen and lounge" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-6">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Roommate matching</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">A compatibility score you can actually read</h2>
            <p className="text-muted-foreground">
              Create a roommate profile and NestMate ranks other tenants by how well you fit — with a transparent
              breakdown so you know <em>why</em> someone is a great match.
            </p>
            <ul className="space-y-3">
              {matchWeights.map((w) => (
                <li key={w.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{w.label}</span>
                    <span className="text-muted-foreground">{w.weight} pts</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(w.weight / 30) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild>
              <Link href="/register">
                Create my roommate profile <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cities */}
      {snapshot && snapshot.cities.length > 0 && (
        <section className="container-page py-20">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">Browse by city</p>
            <h2 className="font-heading text-3xl font-bold tracking-tight">Where people are moving</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {snapshot.cities.map(({ city, count }) => (
              <Link
                key={city}
                href={`/properties?city=${encodeURIComponent(city)}`}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:border-primary hover:text-primary"
              >
                <MapPin className="size-4" aria-hidden /> {city}
                <span className="rounded-full bg-muted px-2 text-xs text-muted-foreground">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div className="bg-grid absolute inset-0 opacity-10" aria-hidden />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <Wrench className="mx-auto size-8 opacity-80" aria-hidden />
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Own a property? Fill your rooms faster.</h2>
            <p className="text-primary-foreground/80">
              List buildings, units and rooms in minutes, manage requests from one inbox and get paid through Stripe.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="h-11 px-6" asChild>
                <Link href="/register">Create an owner account</Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-11 px-6 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                <Link href="/services">See all services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
