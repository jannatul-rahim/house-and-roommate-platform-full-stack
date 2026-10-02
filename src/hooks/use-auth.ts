"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { primaryRole, ROLE_HOME } from "@/lib/auth/constants";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { useAuthStore } from "@/store/auth-store";
import type { ApiErrorBody, AuthUser, Role } from "@/types/api";

export const sessionQueryKey = ["session"] as const;

async function postAuth<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => null)) as { success: boolean; data: T } | ApiErrorBody | null;
  if (!res.ok || !json || !json.success) {
    const err = json as ApiErrorBody | null;
    throw new ApiError(res.status, err?.message ?? "Request failed", err?.errors ?? []);
  }
  return (json as { data: T }).data;
}

/** Signed-in user for client components; mirrors it into the Zustand store. */
export function useSession() {
  const setUser = useAuthStore((s) => s.setUser);
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      const json = (await res.json()) as { data: AuthUser | null };
      return json.data;
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data !== undefined) setUser(query.data);
  }, [query.data, setUser]);

  return { user: query.data ?? null, isLoading: query.isLoading };
}

/** Shared success path for every way of signing in. */
function useSignedIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return (user: AuthUser, redirectTo?: string | null) => {
    setUser(user);
    queryClient.setQueryData(sessionQueryKey, user);
    toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
    const home = ROLE_HOME[primaryRole(user.roles)];
    // Only honour same-site relative redirects.
    const target = redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : home;
    router.replace(target);
    router.refresh();
  };
}

export function useLogin() {
  const onSignedIn = useSignedIn();
  return useMutation({
    mutationFn: (input: { email: string; password: string; redirectTo?: string | null }) =>
      postAuth<{ user: AuthUser }>("/api/auth/login", { email: input.email, password: input.password }),
    onSuccess: (data, input) => onSignedIn(data.user, input.redirectTo),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDemoLogin() {
  const onSignedIn = useSignedIn();
  return useMutation({
    mutationFn: (role: Role) => postAuth<{ user: AuthUser }>("/api/auth/demo", { role }),
    // Demo buttons always land on the role's own dashboard.
    onSuccess: (data) => onSignedIn(data.user),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRegister() {
  const onSignedIn = useSignedIn();
  return useMutation({
    mutationFn: (input: unknown) => postAuth<{ user: AuthUser }>("/api/auth/register", input),
    onSuccess: (data) => onSignedIn(data.user),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: () => postAuth<null>("/api/auth/logout"),
    onSettled: () => {
      setUser(null);
      queryClient.clear();
      queryClient.setQueryData(sessionQueryKey, null);
      toast.success("You have been signed out.");
      router.replace("/login");
      router.refresh();
    },
  });
}
