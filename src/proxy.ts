import { NextResponse, type NextRequest } from "next/server";
import { backendAuth, type SessionTokens } from "@/lib/auth/backend";
import {
  ACCESS_COOKIE,
  PROTECTED_PREFIXES,
  REFRESH_COOKIE,
  primaryRole,
  ROLE_HOME,
} from "@/lib/auth/constants";
import { setSessionCookies } from "@/lib/auth/cookies";
import { isExpired, readAccessToken } from "@/lib/auth/token";

/**
 * Route-level authorization (Next.js 16 renamed `middleware.ts` to `proxy.ts`).
 *
 *  - /admin/*     -> ADMIN only
 *  - /provider/*  -> OWNER only
 *  - /dashboard/* -> TENANT only
 *  - /login, /register -> bounced to the user's dashboard when signed in
 *
 * It also refreshes an expired access token on real navigations so Server
 * Components always render with a valid session.
 */
const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:5050/api/v1").replace(/\/$/, "");
const AUTH_PAGES = ["/login", "/register"];

function isPrefetch(request: NextRequest) {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  let claims = readAccessToken(accessToken);
  let refreshed: SessionTokens | null = null;

  // Refresh on real navigations only. Prefetches fire in parallel, and parallel
  // refreshes would replay a rotated refresh token (which the API treats as theft).
  if (isExpired(claims) && refreshToken && !isPrefetch(request)) {
    try {
      refreshed = await backendAuth.refresh(API_BASE_URL, refreshToken);
      claims = readAccessToken(refreshed.accessToken);
    } catch {
      claims = null;
    }
  }

  // An expired-but-present token is still good enough to route a prefetch;
  // the API itself rejects it if it is actually used.
  const signedIn = Boolean(claims && (refreshed || !isExpired(claims) || refreshToken));
  const roles = signedIn && claims ? claims.roles : [];

  const guard = PROTECTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  let response: NextResponse;

  if (guard && !signedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    response = NextResponse.redirect(loginUrl);
  } else if (guard && !roles.includes(guard.role)) {
    // Signed in but wrong role: send them to the dashboard they *can* use.
    response = NextResponse.redirect(new URL(ROLE_HOME[primaryRole(roles)], request.url));
  } else if (AUTH_PAGES.includes(pathname) && signedIn && roles.length) {
    response = NextResponse.redirect(new URL(ROLE_HOME[primaryRole(roles)], request.url));
  } else if (refreshed) {
    // Hand the fresh token to this request's Server Components as well.
    const headers = new Headers(request.headers);
    request.cookies.set(ACCESS_COOKIE, refreshed.accessToken);
    request.cookies.set(REFRESH_COOKIE, refreshed.refreshToken);
    headers.set("cookie", request.cookies.toString());
    response = NextResponse.next({ request: { headers } });
  } else {
    response = NextResponse.next();
  }

  if (refreshed) setSessionCookies(response.cookies, refreshed);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
