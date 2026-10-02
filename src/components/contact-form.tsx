"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site";

const TOPICS = ["Renting a room", "Listing my property", "Payments & billing", "Roommate matching", "Something else"] as const;

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "At most 100 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  topic: z.enum(TOPICS, { error: "Choose a topic" }),
  message: z.string().trim().min(20, "Please write at least 20 characters").max(2000, "At most 2000 characters"),
});
type ContactInput = z.infer<typeof contactSchema>;

/**
 * The API has no contact endpoint, so a validated message opens the user's
 * email client addressed to support, pre-filled with everything they typed.
 */
export function ContactForm() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", topic: undefined, message: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((v) => {
    const body = `${v.message}\n\n— ${v.name} (${v.email})`;
    window.location.href = `mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent(`[${v.topic}] Message from ${v.name}`)}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email app with the message ready to send.");
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Your name" htmlFor="c-name" error={errors.name?.message} required>
          <Input autoComplete="name" {...fieldAria("c-name", errors.name?.message)} {...form.register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="c-email" error={errors.email?.message} required>
          <Input type="email" autoComplete="email" {...fieldAria("c-email", errors.email?.message)} {...form.register("email")} />
        </FormField>
      </div>
      <FormField label="Topic" htmlFor="c-topic" error={errors.topic?.message} required>
        <Controller
          control={form.control}
          name="topic"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="c-topic" className="w-full" aria-invalid={!!errors.topic}>
                <SelectValue placeholder="What can we help with?" />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <FormField label="Message" htmlFor="c-message" error={errors.message?.message} required>
        <Textarea rows={6} {...fieldAria("c-message", errors.message?.message)} {...form.register("message")} />
      </FormField>
      <Button type="submit" className="w-full sm:w-auto">
        <Send /> Send message
      </Button>
    </form>
  );
}
