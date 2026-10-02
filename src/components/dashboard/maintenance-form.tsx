"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, useApiAction } from "@/hooks/use-api";
import { applyServerErrors } from "@/lib/forms";
import { humanize } from "@/lib/format";
import { maintenanceSchema, type MaintenanceInput } from "@/lib/validations/rental";
import { MAINTENANCE_PRIORITIES, type Lease, type MaintenanceRequest } from "@/types/api";

/** Tenants report issues for a room they actively lease (the API enforces this too). */
export function MaintenanceForm() {
  const [open, setOpen] = useState(false);
  const leases = useQuery({
    queryKey: ["leases", "mine", { status: "ACTIVE" }],
    queryFn: () => api.list<Lease>("/leases/my-leases", { status: "ACTIVE", limit: 20 }),
    enabled: open,
  });

  const form = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    mode: "onChange",
    defaultValues: { roomId: "", title: "", description: "", priority: "MEDIUM" },
  });
  const { errors } = form.formState;

  const create = useApiAction((values: MaintenanceInput) => api.post<MaintenanceRequest>("/maintenance-requests", values), {
    success: "Maintenance request sent to your landlord",
    invalidate: [["maintenance"]],
  });

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
      onError: (error) => applyServerErrors(error, form.setError, ["roomId", "title", "description", "priority"]),
    }),
  );

  const noLease = leases.isSuccess && leases.data.data.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Report an issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a maintenance issue</DialogTitle>
          <DialogDescription>Your landlord is notified immediately and can track the fix here.</DialogDescription>
        </DialogHeader>
        {noLease ? (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">You need an active lease before you can report maintenance issues.</p>
        ) : (
          <form id="maintenance-form" onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField label="Room" htmlFor="roomId" error={errors.roomId?.message} required>
              <Controller
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="roomId" className="w-full" aria-invalid={!!errors.roomId}>
                      <SelectValue placeholder={leases.isLoading ? "Loading your rooms…" : "Choose a room"} />
                    </SelectTrigger>
                    <SelectContent>
                      {leases.data?.data.map((lease) => (
                        <SelectItem key={lease.id} value={lease.roomId}>
                          {lease.room.unit.building.property?.title ?? lease.room.unit.building.name} — Room {lease.room.roomNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <FormField label="Title" htmlFor="m-title" error={errors.title?.message} required>
                <Input placeholder="e.g. Kitchen tap is leaking" {...fieldAria("m-title", errors.title?.message)} {...form.register("title")} />
              </FormField>
              <FormField label="Priority" htmlFor="priority">
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAINTENANCE_PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {humanize(p)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <FormField label="Description" htmlFor="m-description" error={errors.description?.message} required>
              <Textarea rows={4} placeholder="What's wrong, where exactly, and since when?" {...fieldAria("m-description", errors.description?.message)} {...form.register("description")} />
            </FormField>
          </form>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {!noLease && (
            <Button type="submit" form="maintenance-form" disabled={create.isPending}>
              {create.isPending && <Loader2 className="animate-spin" />} Submit request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
