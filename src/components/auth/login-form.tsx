"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { DemoLogin } from "./demo-login";
import { PasswordInput } from "./password-input";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  useEffect(() => {
    if (searchParams.get("expired")) toast.info("Your session expired. Please sign in again.");
    if (searchParams.get("google_oauth_error")) toast.error("Google sign-in was cancelled.");
  }, [searchParams]);

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground">Login to your account</p>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => login.mutate({ email: values.email, password: values.password, redirectTo }))}
        className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm"
        noValidate
      >
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" className="h-10" {...fieldAria("email", errors.email?.message)} {...form.register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" placeholder="••••••••" {...fieldAria("password", errors.password?.message)} {...form.register("password")} />
        </FormField>
        <Button type="submit" className="h-10 w-full" disabled={login.isPending}>
          {login.isPending ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Login
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <DemoLogin />

      <p className="text-center text-sm text-muted-foreground">
        New to NestMate?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
