import type { Role } from "@/types/api";

export const ACCESS_COOKIE = "nm_at";
export const REFRESH_COOKIE = "nm_rt";

/** Refresh a little before the 15-minute access token actually expires. */
export const ACCESS_TOKEN_SKEW_SECONDS = 30;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  OWNER: "/provider",
  TENANT: "/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  OWNER: "Property Owner",
  TENANT: "Tenant",
};

/** Route prefix -> role required to enter it. */
export const PROTECTED_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/provider", role: "OWNER" },
  { prefix: "/dashboard", role: "TENANT" },
];

/** A user can hold several roles; the most privileged one decides their home. */
export function primaryRole(roles: readonly Role[]): Role {
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("OWNER")) return "OWNER";
  return "TENANT";
}
