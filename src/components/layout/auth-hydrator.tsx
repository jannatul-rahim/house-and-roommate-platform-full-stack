"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { sessionQueryKey } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/api";

/** Seeds the client stores with the user the server already resolved. */
export function AuthHydrator({ user }: { user: AuthUser }) {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    setUser(user);
    queryClient.setQueryData(sessionQueryKey, user);
  }, [user, setUser, queryClient]);

  return null;
}
