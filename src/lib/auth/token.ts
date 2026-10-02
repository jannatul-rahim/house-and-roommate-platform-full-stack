import { decodeJwt } from "jose";
import type { Role } from "@/types/api";
import { ACCESS_TOKEN_SKEW_SECONDS } from "./constants";

export interface AccessTokenClaims {
  userId: string;
  roles: Role[];
  exp: number;
}

/**
 * Reads (does NOT verify) the access token claims. Used only for routing
 * decisions - the backend re-verifies the signature and re-reads roles from
 * the database on every API call, so a forged token gains nothing.
 */
export function readAccessToken(token: string | undefined): AccessTokenClaims | null {
  if (!token) return null;
  try {
    const claims = decodeJwt(token);
    const roles = Array.isArray(claims.roles) ? (claims.roles as Role[]) : [];
    const userId = typeof claims.userId === "string" ? claims.userId : claims.sub;
    if (!userId || typeof claims.exp !== "number") return null;
    return { userId, roles, exp: claims.exp };
  } catch {
    return null;
  }
}

export function isExpired(claims: AccessTokenClaims | null): boolean {
  if (!claims) return true;
  return claims.exp - ACCESS_TOKEN_SKEW_SECONDS <= Math.floor(Date.now() / 1000);
}
