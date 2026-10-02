"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, FileText, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-auth";
import { api } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";
import { formatDate, toDateInputValue } from "@/lib/format";
import {
  applicationSchema,
  viewingRequestSchema,
  type ApplicationInput,
  type ViewingRequestInput,
} from "@/lib/validations/rental";
import type { Application, PublicRoom, ViewingRequest } from "@/types/api";

function ViewingDialog({ room }: { room: PublicRoom }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const window0 = room.availability[0];
  const today = toDateInputValue(new Date());
  const minDate = window0 && toDateInputValue(window0.availableFrom) > today ? toDateInputValue(window0.availableFrom) : today;
  const maxDate = window0?.availableTo ? toDateInputValue(window0.availableTo) : undefined;

  const form = useForm<ViewingRequestInput>({
    resolver: zodResolver(viewingRequestSchema),
    mode: "onChange",
    defaultValues: { requestedDate: "", requestedTime: "", message: "" },
  });
  const { errors } = form.formState;

  const mutation = useMutation({
    mutationFn: (values: ViewingRequestInput) => {
      const time = values.requestedTime || "12:00";
      return api.post<ViewingRequest>("/viewing-requests", {
        roomId: room.id,
        requestedDate: new Date(`${values.requestedDate}T${time}:00`).toISOString(),
        requestedTime: values.requestedTime || undefined,
        message: values.message?.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Viewing requested! The owner will confirm shortly.");
      queryClient.invalidateQueries({ queryKey: ["viewing-requests"] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      applyServerErrors(error, form.setError, ["requestedDate", "requestedTime", "message"]);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarPlus /> Request viewing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a viewing — Room {room.roomNumber}</DialogTitle>
          <DialogDescription>
            {window0
              ? `Available ${formatDate(window0.availableFrom)}${window0.availableTo ? ` to ${formatDate(window0.availableTo)}` : " onwards"}.`
              : "Pick a date and the owner will confirm."}
          </DialogDescription>
        </DialogHeader>
        <form id={`viewing-${room.id}`} className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date" htmlFor="requestedDate" error={errors.requestedDate?.message} required>
              <Input type="date" min={minDate} max={maxDate} {...fieldAria("requestedDate", errors.requestedDate?.message)} {...form.register("requestedDate")} />
            </FormField>
            <FormField label="Preferred time" htmlFor="requestedTime" error={errors.requestedTime?.message}>
              <Input type="time" {...fieldAria("requestedTime", errors.requestedTime?.message)} {...form.register("requestedTime")} />
            </FormField>
          </div>
          <FormField label="Message to owner" htmlFor="viewing-message" error={errors.message?.message} description="Optional — introduce yourself or ask a question.">
            <Textarea rows={3} {...fieldAria("viewing-message", errors.message?.message)} {...form.register("message")} />
          </FormField>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`viewing-${room.id}`} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin" />} Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const NO_VIEWING = "__none__";

function ApplyDialog({ room }: { room: PublicRoom }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
    defaultValues: { message: "", viewingRequestId: NO_VIEWING },
  });
  const { errors } = form.formState;

  // Approved viewings for this room can be attached to strengthen the application.
  const viewings = useQuery({
    queryKey: ["viewing-requests", "mine", room.id, "APPROVED"],
    queryFn: () => api.list<ViewingRequest>("/viewing-requests/my-requests", { roomId: room.id, status: "APPROVED", limit: 20 }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: ApplicationInput) =>
      api.post<Application>("/applications", {
        roomId: room.id,
        viewingRequestId: values.viewingRequestId && values.viewingRequestId !== NO_VIEWING ? values.viewingRequestId : undefined,
        message: values.message?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Application submitted! Track it from your dashboard.");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      form.reset();
      setOpen(false);
    },
    onError: (error) => applyServerErrors(error, form.setError, ["message", "viewingRequestId"]),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FileText /> Apply
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Room {room.roomNumber}</DialogTitle>
          <DialogDescription>The owner reviews your application and, once approved, creates your lease.</DialogDescription>
        </DialogHeader>
        <form id={`apply-${room.id}`} className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))} noValidate>
          <FormField label="Attach an approved viewing" htmlFor="viewingRequestId" description="Optional — applications after a viewing are approved faster.">
            <Select value={form.watch("viewingRequestId")} onValueChange={(v) => form.setValue("viewingRequestId", v)}>
              <SelectTrigger id="viewingRequestId" className="w-full">
                <SelectValue placeholder="No viewing attached" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_VIEWING}>No viewing attached</SelectItem>
                {viewings.data?.data.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    Viewing on {formatDate(v.requestedDate)}
                    {v.requestedTime ? ` at ${v.requestedTime}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Message" htmlFor="apply-message" error={errors.message?.message} description="Tell the owner about yourself, your work and planned move-in.">
            <Textarea rows={4} {...fieldAria("apply-message", errors.message?.message)} {...form.register("message")} />
          </FormField>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`apply-${room.id}`} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin" />} Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Role-aware actions: tenants can book/apply, others get a clear explanation. */
export function RoomActions({ room }: { room: PublicRoom }) {
  const { user, isLoading } = useSession();
  const pathname = usePathname();

  if (isLoading) return <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />;

  if (!user) {
    return (
      <Button size="sm" variant="outline" asChild>
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
          <LogIn /> Sign in to book or apply
        </Link>
      </Button>
    );
  }

  if (!user.roles.includes("TENANT")) {
    return <p className="text-xs text-muted-foreground">Viewing and applying is available to tenant accounts.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ViewingDialog room={room} />
      <ApplyDialog room={room} />
    </div>
  );
}

