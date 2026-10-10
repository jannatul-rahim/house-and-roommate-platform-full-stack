import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  DoorOpen,
  Layers,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { RoomActions } from "@/components/property/room-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/errors";
import { serverApi } from "@/lib/api/server";
import { formatCurrency, formatDate, humanize, locationLine } from "@/lib/format";
import { propertyGallery, roomPhoto } from "@/lib/property-media";
import type { PublicProperty } from "@/types/api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getProperty = cache(async (id: string) => {
  if (!UUID.test(id)) notFound();
  try {
    return await serverApi.get<PublicProperty>(`/properties/${id}`, { revalidate: 30 });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  const description =
    property.description ??
    `${humanize(property.propertyType)} in ${locationLine(property)} with ${property.availableRoomCount} room(s) available on NestMate.`;
  const cover = propertyGallery(property.id, property.propertyType, property.images)[0];
  return {
    title: property.title,
    description,
    openGraph: { title: property.title, description, images: [{ url: cover, width: 1600, height: 1067 }] },
  };
}

export default async function PropertyDetailPage({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  const property = await getProperty(id);
  const gallery = propertyGallery(property.id, property.propertyType, property.images).slice(0, 4);
  const rooms = property.rooms ?? [];

  const facts = [
    { icon: Building2, label: "Type", value: humanize(property.propertyType) },
    { icon: DoorOpen, label: "Rooms free", value: property.availableRoomCount },
    {
      icon: Wallet,
      label: "Rent",
      value:
        property.minMonthlyRent === null
          ? "On request"
          : property.minMonthlyRent === property.maxMonthlyRent
            ? formatCurrency(property.minMonthlyRent)
            : `${formatCurrency(property.minMonthlyRent)} – ${formatCurrency(property.maxMonthlyRent)}`,
    },
    { icon: CalendarDays, label: "Listed", value: formatDate(property.createdAt) },
  ];

  return (
    <div className="container-page space-y-10 py-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/properties">
          <ArrowLeft /> Back to listings
        </Link>
      </Button>

      {/* Gallery */}
      <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
        <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl ${gallery.length > 1 ? "md:col-span-2 md:row-span-2 md:aspect-auto" : "md:col-span-4 md:aspect-[16/7]"}`}>
          <Image src={gallery[0]} alt={property.title} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        {gallery.slice(1).map((src, i) => (
          <div key={src} className={`relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:block ${i === 2 ? "md:col-span-2 md:aspect-auto" : ""}`}>
            <Image src={src} alt={`${property.title} interior ${i + 1}`} fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-10">
          <header className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{humanize(property.propertyType)}</Badge>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="size-3" /> Published listing
              </Badge>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{property.title}</h1>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {property.address}, {locationLine(property)}
              {property.zipCode ? ` ${property.zipCode}` : ""}
            </p>
          </header>

          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-xl border bg-card p-4">
                <fact.icon className="mb-2 size-5 text-primary" aria-hidden />
                <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                <dd className="font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <section className="space-y-3">
            <h2 className="font-heading text-xl font-semibold">About this property</h2>
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {property.description ?? "The owner hasn't added a description yet. Request a viewing to see the property in person."}
            </p>
          </section>

          <section className="space-y-4" aria-labelledby="rooms-heading">
            <div className="flex items-end justify-between">
              <h2 id="rooms-heading" className="font-heading text-xl font-semibold">
                Available rooms
              </h2>
              <span className="text-sm text-muted-foreground">{rooms.length} listed</span>
            </div>
            {rooms.length ? (
              <ul className="space-y-4">
                {rooms.map((room) => (
                  <li key={room.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card sm:flex-row">
                    <div className="relative aspect-[16/9] sm:aspect-auto sm:w-48">
                      <Image src={roomPhoto(room.id)} alt={`Room ${room.roomNumber}`} fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-heading text-lg font-semibold">
                            {room.name ?? `Room ${room.roomNumber}`}{" "}
                            <span className="text-sm font-normal text-muted-foreground">· {humanize(room.roomType)}</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {room.buildingName} · Unit {room.unitNumber}
                            {room.floor !== null ? ` · Floor ${room.floor}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-xl font-bold text-primary">{formatCurrency(room.monthlyRent)}</p>
                          <p className="text-xs text-muted-foreground">per month</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-4" aria-hidden /> {room.bedrooms} bed unit
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="size-4" aria-hidden /> {room.bathrooms} bath
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="size-4" aria-hidden /> Deposit {formatCurrency(room.securityDeposit)}
                        </span>
                      </div>
                      {room.availability.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Available: </span>
                          <span className="text-muted-foreground">
                            {room.availability
                              .map((w) => `${formatDate(w.availableFrom)} – ${w.availableTo ? formatDate(w.availableTo) : "open-ended"}`)
                              .join(", ")}
                          </span>
                        </p>
                      )}
                      <div className="mt-auto pt-1">
                        <RoomActions room={room} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={DoorOpen}
                title="No rooms open right now"
                description="Every room in this property is currently taken. Check back later or browse similar listings."
                action={
                  <Button variant="outline" asChild>
                    <Link href={`/properties?city=${encodeURIComponent(property.city)}`}>More in {property.city}</Link>
                  </Button>
                }
              />
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Monthly rent from</p>
            <p className="font-heading text-3xl font-bold text-primary">
              {property.minMonthlyRent !== null ? formatCurrency(property.minMonthlyRent) : "On request"}
            </p>
            <ul className="my-5 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Rooms available</span>
                <span className="font-semibold">{property.availableRoomCount}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="font-semibold">{property.city}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Payments</span>
                <span className="font-semibold">Stripe · BDT</span>
              </li>
            </ul>
            <Button className="w-full" asChild>
              <a href="#rooms-heading">See rooms & book</a>
            </Button>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-5 text-sm text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">How booking works</p>
            Request a viewing inside the availability window, apply once you&apos;ve seen it, and the owner creates your
            lease on approval. Rent is then paid securely online.
          </div>
        </aside>
      </div>
    </div>
  );
}
