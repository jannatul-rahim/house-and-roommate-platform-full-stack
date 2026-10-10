"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CircleDashed, Loader2, Rocket, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { PhotoPicker, uploadPropertyImages } from "@/components/provider/property-images";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { dateInputToIso, formatCurrency, formatDate, humanize, toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { propertyWizardSchema, type PropertyWizardInput, type PropertyWizardOutput } from "@/lib/validations/property";
import { PROPERTY_TYPES, ROOM_TYPES, type Building, type Property, type Room, type Unit } from "@/types/api";

type Field = FieldPath<PropertyWizardInput>;

const STEPS: { id: string; title: string; fields: Field[] }[] = [
  { id: "basics", title: "Basics", fields: ["property.title", "property.propertyType", "property.description"] },
  { id: "location", title: "Location", fields: ["property.address", "property.city", "property.state", "property.country", "property.zipCode"] },
  { id: "unit", title: "Building & unit", fields: ["building.name", "building.description", "unit.unitNumber", "unit.floor", "unit.bedrooms", "unit.bathrooms"] },
  { id: "room", title: "First room", fields: ["room.roomNumber", "room.name", "room.roomType", "room.monthlyRent", "room.securityDeposit", "availability.availableFrom", "availability.availableTo"] },
  { id: "photos", title: "Photos", fields: [] },
  { id: "review", title: "Review", fields: [] },
];

const TASKS = ["Property", "Building", "Unit", "Room", "Availability", "Photos"] as const;
type TaskState = "idle" | "running" | "done" | "error";

const today = toDateInputValue(new Date());
const nextYear = toDateInputValue(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

/**
 * Multi-step "Post a property" wizard. On submit it walks the API's resource
 * chain (property -> building -> unit -> room -> availability) and reports
 * progress for each call.
 */
export function PropertyWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [tasks, setTasks] = useState<Record<(typeof TASKS)[number], TaskState> | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);
  // Set when a later step fails after the property itself was created.
  const [partialId, setPartialId] = useState<string | null>(null);

  const form = useForm<PropertyWizardInput, unknown, PropertyWizardOutput>({
    resolver: zodResolver(propertyWizardSchema),
    mode: "onTouched",
    defaultValues: {
      property: { title: "", description: "", propertyType: "APARTMENT", address: "", city: "", state: "", country: "Bangladesh", zipCode: "", status: "PUBLISHED" },
      building: { name: "", description: "" },
      unit: { unitNumber: "", floor: 1, bedrooms: 2, bathrooms: 1, status: "AVAILABLE" },
      room: { roomNumber: "", name: "", roomType: "PRIVATE", monthlyRent: "", securityDeposit: "", status: "AVAILABLE" },
      availability: { availableFrom: today, availableTo: nextYear },
    },
  });
  const { errors } = form.formState;
  const v = form.watch();
  const submitting = tasks !== null && !Object.values(tasks).includes("error") && !createdId;

  const next = async () => {
    if (await form.trigger(STEPS[step].fields, { shouldFocus: true })) setStep((s) => s + 1);
  };

  const run = async (values: PropertyWizardOutput) => {
    const state = Object.fromEntries(TASKS.map((t) => [t, "idle"])) as Record<(typeof TASKS)[number], TaskState>;
    const mark = (task: (typeof TASKS)[number], s: TaskState) => {
      state[task] = s;
      setTasks({ ...state });
    };
    let current: (typeof TASKS)[number] = "Property";
    let propertyId: string | null = null;
    try {
      const clean = <T extends Record<string, unknown>>(obj: T) =>
        Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== "" && value !== undefined)) as Partial<T>;

      mark("Property", "running");
      const property = await api.post<Property>("/properties", clean(values.property));
      propertyId = property.id;
      mark("Property", "done");

      current = "Building";
      mark("Building", "running");
      const building = await api.post<Building>(`/properties/${property.id}/buildings`, clean(values.building));
      mark("Building", "done");

      current = "Unit";
      mark("Unit", "running");
      const unit = await api.post<Unit>(`/buildings/${building.id}/units`, clean(values.unit));
      mark("Unit", "done");

      current = "Room";
      mark("Room", "running");
      const room = await api.post<Room>(`/units/${unit.id}/rooms`, clean(values.room));
      mark("Room", "done");

      current = "Availability";
      mark("Availability", "running");
      await api.post(`/rooms/${room.id}/availability`, {
        availableFrom: dateInputToIso(values.availability.availableFrom),
        availableTo: dateInputToIso(values.availability.availableTo, true),
      });
      mark("Availability", "done");

      if (photos.length) {
        current = "Photos";
        mark("Photos", "running");
        await uploadPropertyImages(property.id, photos);
        mark("Photos", "done");
      } else {
        mark("Photos", "done");
      }

      setCreatedId(property.id);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success(`"${property.title}" is ${values.property.status === "PUBLISHED" ? "live" : "saved as a draft"}!`);
      router.refresh();
    } catch (error) {
      mark(current, "error");
      toast.error(getErrorMessage(error));
      setPartialId(propertyId);
    }
  };

  const select = (name: Field, options: readonly string[], id: string) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {humanize(o)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );

  if (tasks) {
    return (
      <Card>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-1 text-center">
            <h2 className="font-heading text-xl font-semibold">{createdId ? "Your property is ready 🎉" : "Creating your listing…"}</h2>
            <p className="text-sm text-muted-foreground">We create each part of the listing in order.</p>
          </div>
          <ol className="mx-auto max-w-sm space-y-3">
            {TASKS.map((task) => {
              const s = tasks[task];
              return (
                <li key={task} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                  {s === "done" && <Check className="size-5 text-emerald-600" />}
                  {s === "running" && <Loader2 className="size-5 animate-spin text-primary" />}
                  {s === "error" && <XCircle className="size-5 text-destructive" />}
                  {s === "idle" && <CircleDashed className="size-5 text-muted-foreground" />}
                  <span className={cn("font-medium", s === "idle" && "text-muted-foreground")}>{task}</span>
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap justify-center gap-2">
            {createdId && (
              <>
                <Button asChild>
                  <Link href={`/provider/properties/${createdId}`}>Manage property</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/provider/properties">Back to listings</Link>
                </Button>
              </>
            )}
            {!createdId && !submitting && (
              <>
                {partialId ? (
                  <Button asChild>
                    <Link href={`/provider/properties/${partialId}`}>Finish setup on the manage page</Link>
                  </Button>
                ) : (
                  <Button onClick={() => setTasks(null)}>Edit details and retry</Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS} current={step} />
      <Card>
        <CardContent className="p-6">
          <form
            noValidate
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (step === STEPS.length - 1) void form.handleSubmit(run)();
              else void next();
            }}
          >
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="font-heading text-xl font-semibold">{STEPS[step].title}</h2>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <FormField label="Listing title" htmlFor="p-title" error={errors.property?.title?.message} required>
                  <Input placeholder="e.g. Lakeview Shared Apartment, Gulshan 2" {...fieldAria("p-title", errors.property?.title?.message)} {...form.register("property.title")} />
                </FormField>
                <FormField label="Property type" htmlFor="p-type" required>
                  {select("property.propertyType", PROPERTY_TYPES, "p-type")}
                </FormField>
                <FormField label="Description" htmlFor="p-desc" error={errors.property?.description?.message} description="Highlight amenities, transport and house rules.">
                  <Textarea rows={5} {...fieldAria("p-desc", errors.property?.description?.message)} {...form.register("property.description")} />
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Street address" htmlFor="p-address" error={errors.property?.address?.message} required className="sm:col-span-2">
                  <Input placeholder="Road 71, House 12, Gulshan 2" {...fieldAria("p-address", errors.property?.address?.message)} {...form.register("property.address")} />
                </FormField>
                <FormField label="City" htmlFor="p-city" error={errors.property?.city?.message} required>
                  <Input placeholder="Dhaka" {...fieldAria("p-city", errors.property?.city?.message)} {...form.register("property.city")} />
                </FormField>
                <FormField label="State / division" htmlFor="p-state" error={errors.property?.state?.message}>
                  <Input placeholder="Dhaka Division" {...fieldAria("p-state", errors.property?.state?.message)} {...form.register("property.state")} />
                </FormField>
                <FormField label="Country" htmlFor="p-country" error={errors.property?.country?.message} required>
                  <Input {...fieldAria("p-country", errors.property?.country?.message)} {...form.register("property.country")} />
                </FormField>
                <FormField label="Postcode" htmlFor="p-zip" error={errors.property?.zipCode?.message}>
                  <Input placeholder="1212" {...fieldAria("p-zip", errors.property?.zipCode?.message)} {...form.register("property.zipCode")} />
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Building name" htmlFor="b-name" error={errors.building?.name?.message} required>
                  <Input placeholder="Lakeview Tower" {...fieldAria("b-name", errors.building?.name?.message)} {...form.register("building.name")} />
                </FormField>
                <FormField label="Unit / flat number" htmlFor="u-number" error={errors.unit?.unitNumber?.message} required>
                  <Input placeholder="7A" {...fieldAria("u-number", errors.unit?.unitNumber?.message)} {...form.register("unit.unitNumber")} />
                </FormField>
                <FormField label="Floor" htmlFor="u-floor" error={errors.unit?.floor?.message}>
                  <Input type="number" {...fieldAria("u-floor", errors.unit?.floor?.message)} {...form.register("unit.floor")} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Bedrooms" htmlFor="u-bed" error={errors.unit?.bedrooms?.message}>
                    <Input type="number" min={0} {...fieldAria("u-bed", errors.unit?.bedrooms?.message)} {...form.register("unit.bedrooms")} />
                  </FormField>
                  <FormField label="Bathrooms" htmlFor="u-bath" error={errors.unit?.bathrooms?.message}>
                    <Input type="number" min={0} {...fieldAria("u-bath", errors.unit?.bathrooms?.message)} {...form.register("unit.bathrooms")} />
                  </FormField>
                </div>
                <FormField label="Building description" htmlFor="b-desc" error={errors.building?.description?.message} className="sm:col-span-2">
                  <Input placeholder="Lift, generator, rooftop garden…" {...fieldAria("b-desc", errors.building?.description?.message)} {...form.register("building.description")} />
                </FormField>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Room number" htmlFor="r-number" error={errors.room?.roomNumber?.message} required>
                  <Input placeholder="A1" {...fieldAria("r-number", errors.room?.roomNumber?.message)} {...form.register("room.roomNumber")} />
                </FormField>
                <FormField label="Room type" htmlFor="r-type" required>
                  {select("room.roomType", ROOM_TYPES, "r-type")}
                </FormField>
                <FormField label="Room name" htmlFor="r-name" error={errors.room?.name?.message} className="sm:col-span-2">
                  <Input placeholder="Master bedroom with balcony" {...fieldAria("r-name", errors.room?.name?.message)} {...form.register("room.name")} />
                </FormField>
                <FormField label="Monthly rent (৳)" htmlFor="r-rent" error={errors.room?.monthlyRent?.message} required>
                  <Input inputMode="decimal" placeholder="16000" {...fieldAria("r-rent", errors.room?.monthlyRent?.message)} {...form.register("room.monthlyRent")} />
                </FormField>
                <FormField label="Security deposit (৳)" htmlFor="r-dep" error={errors.room?.securityDeposit?.message} required>
                  <Input inputMode="decimal" placeholder="16000" {...fieldAria("r-dep", errors.room?.securityDeposit?.message)} {...form.register("room.securityDeposit")} />
                </FormField>
                <FormField label="Available from" htmlFor="a-from" error={errors.availability?.availableFrom?.message} required>
                  <Input type="date" {...fieldAria("a-from", errors.availability?.availableFrom?.message)} {...form.register("availability.availableFrom")} />
                </FormField>
                <FormField label="Available until" htmlFor="a-to" error={errors.availability?.availableTo?.message} required>
                  <Input type="date" {...fieldAria("a-to", errors.availability?.availableTo?.message)} {...form.register("availability.availableTo")} />
                </FormField>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <PhotoPicker files={photos} onChange={setPhotos} />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <dl className="grid gap-4 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">Listing</dt>
                    <dd className="font-heading text-lg font-semibold">{v.property.title}</dd>
                    <dd className="text-muted-foreground">
                      {humanize(v.property.propertyType)} · {v.property.address}, {v.property.city}, {v.property.country}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Building / unit</dt>
                    <dd className="font-medium">
                      {v.building.name} · Unit {v.unit.unitNumber} ({String(v.unit.bedrooms)} bed / {String(v.unit.bathrooms)} bath)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">First room</dt>
                    <dd className="font-medium">
                      Room {v.room.roomNumber} · {humanize(v.room.roomType)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Rent / deposit</dt>
                    <dd className="font-medium">
                      {formatCurrency(v.room.monthlyRent)} / {formatCurrency(v.room.securityDeposit)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Photos</dt>
                    <dd className="font-medium">{photos.length ? `${photos.length} selected` : "None — a placeholder will be shown"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Availability</dt>
                    <dd className="font-medium">
                      {formatDate(v.availability.availableFrom)} – {formatDate(v.availability.availableTo)}
                    </dd>
                  </div>
                </dl>
                <FormField label="Visibility" htmlFor="p-status" description="Drafts stay private until you publish them from My properties.">
                  <Controller
                    control={form.control}
                    name="property.status"
                    render={({ field }) => (
                      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" id="p-status">
                        {(["PUBLISHED", "DRAFT"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            role="radio"
                            aria-checked={field.value === s}
                            onClick={() => field.onChange(s)}
                            className={cn("rounded-xl border p-4 text-left text-sm transition-colors hover:border-primary/60", field.value === s && "border-primary bg-primary/5 ring-2 ring-primary/20")}
                          >
                            <p className="font-semibold">{s === "PUBLISHED" ? "Publish now" : "Save as draft"}</p>
                            <p className="text-xs text-muted-foreground">{s === "PUBLISHED" ? "Tenants can find and book it immediately." : "Finish later — hidden from search."}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </FormField>
              </div>
            )}

            <div className="flex justify-between border-t pt-5">
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                <ArrowLeft /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="submit">
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button type="submit">
                  <Rocket /> Create listing
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
