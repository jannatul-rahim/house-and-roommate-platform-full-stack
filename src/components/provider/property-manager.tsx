"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bath, BedDouble, Building2, CalendarPlus, DoorOpen, ExternalLink, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, useApiAction } from "@/hooks/use-api";
import { dateInputToIso, formatCurrency, formatDate, humanize, locationLine, toDateInputValue } from "@/lib/format";
import { propertyCover } from "@/lib/property-media";
import { availabilitySchema, buildingSchema, propertyBaseSchema, roomSchema, unitSchema } from "@/lib/validations/property";
import {
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  ROOM_STATUSES,
  ROOM_TYPES,
  UNIT_STATUSES,
  type Building,
  type Property,
  type Room,
  type RoomAvailability,
  type RoomStatus,
  type Unit,
} from "@/types/api";

const strip = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined)) as Partial<T>;

function Availability({ room }: { room: Room }) {
  const queryClient = useQueryClient();
  const key = ["properties", "availability", room.id];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => api.list<RoomAvailability>(`/rooms/${room.id}/availability`, { limit: 20 }),
  });
  const remove = useApiAction((id: string) => api.delete(`/room-availability/${id}`), { success: "Availability window removed", invalidate: [key] });
  const today = toDateInputValue(new Date());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Availability</p>
        <FormDialog
          trigger={
            <Button variant="ghost" size="xs">
              <CalendarPlus /> Add window
            </Button>
          }
          title={`Add availability — Room ${room.roomNumber}`}
          description="Tenants can only book viewings and apply inside an available window."
          schema={availabilitySchema}
          defaultValues={{ availableFrom: today, availableTo: "" }}
          fields={[
            { name: "availableFrom", label: "From", type: "date", required: true },
            { name: "availableTo", label: "Until", type: "date", required: true },
          ]}
          submitLabel="Add window"
          onSubmit={async (v) => {
            await api.post(`/rooms/${room.id}/availability`, { availableFrom: dateInputToIso(v.availableFrom), availableTo: dateInputToIso(v.availableTo, true) });
            await queryClient.invalidateQueries({ queryKey: key });
          }}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-6 w-48" />
      ) : data?.data.length ? (
        <ul className="flex flex-wrap gap-2">
          {data.data.map((w) => (
            <li key={w.id} className="flex items-center gap-1.5 rounded-full border bg-background py-0.5 pr-1 pl-2.5 text-xs">
              {formatDate(w.availableFrom)} – {w.availableTo ? formatDate(w.availableTo) : "open"}
              <StatusBadge status={w.status} className="px-1.5" />
              <button type="button" onClick={() => remove.mutate(w.id)} className="rounded-full p-0.5 text-muted-foreground hover:text-destructive" aria-label="Remove availability window">
                <Trash2 className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-amber-600">No availability yet — tenants can&apos;t book this room.</p>
      )}
    </div>
  );
}

function RoomRow({ room, unitId }: { room: Room; unitId: string }) {
  const queryClient = useQueryClient();
  const listKey = ["properties", "rooms", unitId];
  const setStatus = useApiAction((status: RoomStatus) => api.patch(`/rooms/${room.id}`, { status }), { success: "Room status updated", invalidate: [listKey, ["properties", "mine"]] });
  const remove = useApiAction(() => api.delete(`/rooms/${room.id}`), { success: "Room deleted", invalidate: [listKey] });

  return (
    <li className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            Room {room.roomNumber}
            {room.name && <span className="font-normal text-muted-foreground"> · {room.name}</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            {humanize(room.roomType)} · {formatCurrency(room.monthlyRent)}/mo · Deposit {formatCurrency(room.securityDeposit)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={room.status} onValueChange={(s) => setStatus.mutate(s as RoomStatus)}>
            <SelectTrigger size="sm" className="w-40" aria-label={`Status of room ${room.roomNumber}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {humanize(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDialog
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Edit room ${room.roomNumber}`}>
                <Pencil />
              </Button>
            }
            title={`Edit room ${room.roomNumber}`}
            schema={roomSchema}
            defaultValues={{
              roomNumber: room.roomNumber,
              name: room.name ?? "",
              roomType: room.roomType,
              monthlyRent: String(Number(room.monthlyRent)),
              securityDeposit: String(Number(room.securityDeposit)),
              status: room.status,
            }}
            fields={[...roomFields]}
            onSubmit={async (v) => {
              await api.patch(`/rooms/${room.id}`, strip(v));
              await queryClient.invalidateQueries({ queryKey: listKey });
            }}
          />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label={`Delete room ${room.roomNumber}`}>
                <Trash2 />
              </Button>
            }
            title={`Delete room ${room.roomNumber}?`}
            description="The room disappears from listings. Existing leases and history are kept."
            confirmLabel="Delete room"
            destructive
            onConfirm={() => remove.mutateAsync(undefined)}
          />
        </div>
      </div>
      <Availability room={room} />
    </li>
  );
}

const roomFields = [
  { name: "roomNumber", label: "Room number", required: true, placeholder: "A1" },
  { name: "roomType", label: "Room type", type: "select", options: ROOM_TYPES, required: true },
  { name: "name", label: "Room name", placeholder: "Master bedroom with balcony", wide: true },
  { name: "monthlyRent", label: "Monthly rent (৳)", type: "number", required: true },
  { name: "securityDeposit", label: "Security deposit (৳)", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: ROOM_STATUSES },
] as const;

function UnitRooms({ unit }: { unit: Unit }) {
  const key = ["properties", "rooms", unit.id];
  const { data, isLoading, refetch } = useQuery({ queryKey: key, queryFn: () => api.list<Room>(`/units/${unit.id}/rooms`, { limit: 100, sortBy: "roomNumber", sortOrder: "asc" }) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="size-4" aria-hidden /> {unit.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-4" aria-hidden /> {unit.bathrooms} bath
          </span>
          {unit.floor !== null && (
            <span className="flex items-center gap-1">
              <Layers className="size-4" aria-hidden /> Floor {unit.floor}
            </span>
          )}
        </p>
        <FormDialog
          trigger={
            <Button size="sm" variant="outline">
              <Plus /> Add room
            </Button>
          }
          title={`Add a room to unit ${unit.unitNumber}`}
          schema={roomSchema}
          defaultValues={{ roomNumber: "", name: "", roomType: "PRIVATE", monthlyRent: "", securityDeposit: "", status: "AVAILABLE" }}
          fields={[...roomFields]}
          submitLabel="Add room"
          onSubmit={async (v) => {
            await api.post(`/units/${unit.id}/rooms`, strip(v));
            await refetch();
          }}
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((room) => (
            <RoomRow key={room.id} room={room} unitId={unit.id} />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">No rooms in this unit yet.</p>
      )}
    </div>
  );
}

function BuildingUnits({ building }: { building: Building }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["properties", "units", building.id],
    queryFn: () => api.list<Unit>(`/buildings/${building.id}/units`, { limit: 100, sortBy: "unitNumber", sortOrder: "asc" }),
  });

  return (
    <Card className="gap-0 py-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-heading font-semibold">{building.name}</h3>
              {building.description && <p className="text-sm text-muted-foreground">{building.description}</p>}
            </div>
          </div>
          <FormDialog
            trigger={
              <Button size="sm">
                <Plus /> Add unit
              </Button>
            }
            title={`Add a unit to ${building.name}`}
            schema={unitSchema}
            defaultValues={{ unitNumber: "", floor: 1, bedrooms: 2, bathrooms: 1, status: "AVAILABLE" }}
            fields={[
              { name: "unitNumber", label: "Unit number", required: true, placeholder: "7A" },
              { name: "floor", label: "Floor", type: "number" },
              { name: "bedrooms", label: "Bedrooms", type: "number" },
              { name: "bathrooms", label: "Bathrooms", type: "number" },
              { name: "status", label: "Status", type: "select", options: UNIT_STATUSES, wide: true },
            ]}
            submitLabel="Add unit"
            onSubmit={async (v) => {
              await api.post(`/buildings/${building.id}/units`, v);
              await refetch();
            }}
          />
        </div>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : data?.data.length ? (
          <Accordion type="multiple" defaultValue={data.data.slice(0, 1).map((u) => u.id)} className="rounded-xl border">
            {data.data.map((unit) => (
              <AccordionItem key={unit.id} value={unit.id} className="px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex items-center gap-3">
                    <DoorOpen className="size-4 text-primary" aria-hidden /> Unit {unit.unitNumber}
                    <StatusBadge status={unit.status} />
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <UnitRooms unit={unit} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">No units yet — add one to start listing rooms.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function PropertyManager({ propertyId }: { propertyId: string }) {
  // The API has no owner "get by id" for drafts, so read it from the owner's list.
  const property = useQuery({
    queryKey: ["properties", "mine", "detail", propertyId],
    queryFn: async () => {
      const { data } = await api.list<Property>("/properties/my-properties", { limit: 100 });
      return data.find((p) => p.id === propertyId) ?? null;
    },
  });
  const buildings = useQuery({
    queryKey: ["properties", "buildings", propertyId],
    queryFn: () => api.list<Building>(`/properties/${propertyId}/buildings`, { limit: 100, sortBy: "name", sortOrder: "asc" }),
    enabled: !!property.data,
  });

  if (property.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!property.data) {
    return (
      <EmptyState
        icon={Building2}
        title="Property not found"
        description="It may have been deleted, or it belongs to another owner."
        action={
          <Button asChild>
            <Link href="/provider/properties">Back to my properties</Link>
          </Button>
        }
      />
    );
  }

  const p = property.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/provider/properties">
          <ArrowLeft /> My properties
        </Link>
      </Button>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/9] sm:aspect-auto sm:w-64">
            <Image src={propertyCover(p.id, p.propertyType, 600)} alt={p.title} fill sizes="(min-width: 640px) 256px, 100vw" className="object-cover" />
          </div>
          <CardContent className="flex flex-1 flex-col gap-3 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted-foreground">{humanize(p.propertyType)}</span>
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight">{p.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {p.address}, {locationLine(p)}
                </p>
              </div>
              <div className="flex gap-2">
                {p.status === "PUBLISHED" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/properties/${p.id}`} target="_blank">
                      <ExternalLink /> Public page
                    </Link>
                  </Button>
                )}
                <FormDialog
                  trigger={
                    <Button size="sm">
                      <Pencil /> Edit details
                    </Button>
                  }
                  title="Edit property"
                  schema={propertyBaseSchema}
                  defaultValues={{
                    title: p.title,
                    description: p.description ?? "",
                    propertyType: p.propertyType,
                    address: p.address,
                    city: p.city,
                    state: p.state ?? "",
                    country: p.country,
                    zipCode: p.zipCode ?? "",
                    status: p.status,
                  }}
                  fields={[
                    { name: "title", label: "Title", required: true, wide: true },
                    { name: "propertyType", label: "Type", type: "select", options: PROPERTY_TYPES },
                    { name: "status", label: "Status", type: "select", options: PROPERTY_STATUSES },
                    { name: "address", label: "Address", required: true, wide: true },
                    { name: "city", label: "City", required: true },
                    { name: "state", label: "State / division" },
                    { name: "country", label: "Country", required: true },
                    { name: "zipCode", label: "Postcode" },
                    { name: "description", label: "Description", type: "textarea" },
                  ]}
                  onSubmit={async (v) => {
                    await api.patch(`/properties/${p.id}`, strip(v));
                    await property.refetch();
                  }}
                />
              </div>
            </div>
            {p.description && <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>}
          </CardContent>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Buildings, units & rooms</h2>
          <FormDialog
            trigger={
              <Button variant="outline" size="sm">
                <Plus /> Add building
              </Button>
            }
            title="Add a building"
            schema={buildingSchema}
            defaultValues={{ name: "", description: "" }}
            fields={[
              { name: "name", label: "Building name", required: true, wide: true },
              { name: "description", label: "Description", type: "textarea" },
            ]}
            submitLabel="Add building"
            onSubmit={async (v) => {
              await api.post(`/properties/${p.id}/buildings`, strip(v));
              await buildings.refetch();
            }}
          />
        </div>
        {buildings.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : buildings.data?.data.length ? (
          <div className="space-y-4">
            {buildings.data.data.map((b) => (
              <BuildingUnits key={b.id} building={b} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Building2} title="No buildings yet" description="Add a building, then units and rooms, so tenants have something to book." />
        )}
      </section>
    </div>
  );
}
