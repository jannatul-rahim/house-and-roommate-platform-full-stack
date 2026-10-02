"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, KeyRound, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/hooks/use-auth";
import { applyServerErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormInput } from "@/lib/validations/auth";
import { PasswordInput } from "./password-input";

const ROLE_OPTIONS = [
  { value: "TENANT", title: "I'm looking for a room", text: "Book viewings, apply, pay rent and find roommates.", icon: KeyRound },
  { value: "OWNER", title: "I'm a property owner", text: "List properties, approve tenants and track earnings.", icon: Building2 },
] as const;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
];

export function RegisterForm() {
  const register = useRegister();
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", role: "TENANT", password: "", confirmPassword: "" },
  });
  const { errors } = form.formState;
  const role = form.watch("role");
  const password = form.watch("password") ?? "";
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;

  const onSubmit = form.handleSubmit((values) =>
    register.mutate(values, {
      onError: (error) => applyServerErrors(error, form.setError, ["name", "email", "phone", "password", "role"]),
    }),
  );

  return (
    <div className="w-full max-w-lg space-y-8 py-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Join NestMate in less than a minute.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm" noValidate>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">How will you use NestMate?</legend>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => form.setValue("role", option.value, { shouldValidate: true })}
                  className={cn(
                    "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all hover:border-primary/60",
                    selected && "border-primary bg-primary/5 ring-2 ring-primary/20",
                  )}
                >
                  {selected && (
                    <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                  <option.icon className="size-5 text-primary" aria-hidden />
                  <span className="text-sm font-semibold">{option.title}</span>
                  <span className="text-xs text-muted-foreground">{option.text}</span>
                </button>
              );
            })}
          </div>
          {errors.role && <p className="text-xs font-medium text-destructive">{errors.role.message}</p>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="name" error={errors.name?.message} required>
            <Input autoComplete="name" className="h-10" {...fieldAria("name", errors.name?.message)} {...form.register("name")} />
          </FormField>
          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" placeholder="+8801…" className="h-10" {...fieldAria("phone", errors.phone?.message)} {...form.register("phone")} />
          </FormField>
        </div>
        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input type="email" autoComplete="email" className="h-10" {...fieldAria("email", errors.email?.message)} {...form.register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput autoComplete="new-password" {...fieldAria("password", errors.password?.message)} {...form.register("password")} />
        </FormField>
        <div className="space-y-2" aria-live="polite">
          <div className="flex gap-1">
            {PASSWORD_RULES.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full bg-muted transition-colors",
                  i < passed && (passed <= 2 ? "bg-rose-500" : passed === 3 ? "bg-amber-500" : "bg-emerald-500"),
                )}
              />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-1 text-xs">
            {PASSWORD_RULES.map((rule) => (
              <li key={rule.label} className={cn("flex items-center gap-1", rule.test(password) ? "text-emerald-600" : "text-muted-foreground")}>
                <Check className="size-3" aria-hidden /> {rule.label}
              </li>
            ))}
          </ul>
        </div>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <PasswordInput autoComplete="new-password" {...fieldAria("confirmPassword", errors.confirmPassword?.message)} {...form.register("confirmPassword")} />
        </FormField>

        <Button type="submit" className="h-10 w-full" disabled={register.isPending}>
          {register.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />} Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
