"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import type { z } from "zod";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/forms";
import { humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DialogField<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "date";
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: readonly (string | { value: string; label: string })[];
  /** Span both columns in the two-column grid. */
  wide?: boolean;
}

interface FormDialogProps<S extends z.ZodType<FieldValues, FieldValues>> {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  schema: S;
  defaultValues: DefaultValues<z.input<S>>;
  fields: DialogField<z.input<S>>[];
  submitLabel?: string;
  onSubmit: (values: z.output<S>) => Promise<unknown>;
}

/**
 * Schema-driven create/edit dialog: React Hook Form + Zod with real-time
 * validation, server error mapping, and pending state. Used for every simple
 * resource form (buildings, units, rooms, bills, preferences…).
 */
export function FormDialog<S extends z.ZodType<FieldValues, FieldValues>>({
  trigger,
  title,
  description,
  schema,
  defaultValues,
  fields,
  submitLabel = "Save",
  onSubmit,
}: FormDialogProps<S>) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<z.input<S>, unknown, z.output<S>>,
    mode: "onTouched",
    defaultValues,
  });
  const formId = `form-${title.replace(/\W+/g, "-").toLowerCase()}`;

  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = form.handleSubmit(async (values) => {
    setPending(true);
    try {
      await onSubmit(values);
      setOpen(false);
    } catch (error) {
      applyServerErrors(error, form.setError, fields.map((f) => String(f.name).split(".")[0]));
    } finally {
      setPending(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form id={formId} onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const id = `${formId}-${String(field.name).replace(/\./g, "-")}`;
            const error = (form.formState.errors as Record<string, { message?: string } | undefined>)[String(field.name)]?.message;
            const wide = field.wide || field.type === "textarea";
            return (
              <FormField key={String(field.name)} label={field.label} htmlFor={id} error={error} description={field.description} required={field.required} className={cn(wide && "sm:col-span-2")}>
                {field.type === "select" ? (
                  <Controller
                    control={form.control}
                    name={field.name}
                    render={({ field: f }) => (
                      <Select value={f.value ? String(f.value) : undefined} onValueChange={f.onChange}>
                        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
                          <SelectValue placeholder={field.placeholder ?? "Select…"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((o) => {
                            const option = typeof o === "string" ? { value: o, label: humanize(o) } : o;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.type === "textarea" ? (
                  <Textarea rows={3} placeholder={field.placeholder} {...fieldAria(id, error)} {...form.register(field.name)} />
                ) : (
                  <Input
                    type={field.type ?? "text"}
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    placeholder={field.placeholder}
                    {...fieldAria(id, error)}
                    {...form.register(field.name)}
                  />
                )}
              </FormField>
            );
          })}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
