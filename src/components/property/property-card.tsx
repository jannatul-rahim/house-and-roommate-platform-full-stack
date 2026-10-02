import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, humanize, locationLine } from "@/lib/format";
import { propertyCover } from "@/lib/property-media";
import type { PublicProperty } from "@/types/api";

export function PropertyCard({ property, priority }: { property: PublicProperty; priority?: boolean }) {
  const hasRange = property.minMonthlyRent !== null && property.maxMonthlyRent !== property.minMonthlyRent;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={propertyCover(property.id, property.propertyType, 800)}
          alt={`${property.title} in ${property.city}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-x-0 top-0 flex justify-between p-3">
          <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {humanize(property.propertyType)}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur ${
              property.availableRoomCount > 0 ? "bg-emerald-500/90 text-white" : "bg-background/90 text-muted-foreground"
            }`}
          >
            {property.availableRoomCount > 0
              ? `${property.availableRoomCount} room${property.availableRoomCount === 1 ? "" : "s"} free`
              : "Fully booked"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-heading text-lg font-semibold group-hover:text-primary">{property.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-1">{locationLine(property)}</span>
          </p>
        </div>
        {property.description && <p className="line-clamp-2 text-sm text-muted-foreground">{property.description}</p>}
        <div className="mt-auto flex items-end justify-between border-t pt-3">
          <div>
            <p className="text-xs text-muted-foreground">{hasRange ? "Rent from" : "Monthly rent"}</p>
            <p className="font-heading text-lg font-bold text-primary">
              {property.minMonthlyRent !== null ? formatCurrency(property.minMonthlyRent) : "On request"}
              {property.minMonthlyRent !== null && <span className="text-xs font-medium text-muted-foreground"> /mo</span>}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            View <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
