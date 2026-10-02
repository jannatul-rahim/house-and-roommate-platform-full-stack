import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env } from "@/lib/env";
import type { ApiResponse, AuthUser, Role } from "@/types/api";
import { ACCESS_COOKIE, primaryRole, ROLE_HOME } from "./constants";

/**
 * Current user for this request, straight from `GET /auth/me` (so roles are
 * always the database's, never the token's). Memoized per request.
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${env.apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<AuthUser>;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
});

/** Server-side guard used by dashboard layouts (defence in depth behind proxy.ts). */
export async function requireRole(role: Role, from: string): Promise<AuthUser> {
  const user = await getSession();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(from)}`);
  if (!user.roles.includes(role)) redirect(ROLE_HOME[primaryRole(user.roles)]);
  return user;
}
