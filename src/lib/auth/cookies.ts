import type { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_TOKEN_MAX_AGE } from "./constants";
import { readAccessToken } from "./token";
import type { SessionTokens } from "./backend";

type ResponseCookies = NextResponse["cookies"];

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookies(cookies: ResponseCookies, tokens: SessionTokens) {
  const claims = readAccessToken(tokens.accessToken);
  const accessMaxAge = claims ? Math.max(claims.exp - Math.floor(Date.now() / 1000), 60) : 15 * 60;

  cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...baseCookie, maxAge: accessMaxAge });
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_TOKEN_MAX_AGE });
}

export function clearSessionCookies(cookies: ResponseCookies) {
  cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}
