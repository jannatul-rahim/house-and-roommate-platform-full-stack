import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendAuth } from "@/lib/auth/backend";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { clearSessionCookies } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  // Revoke server-side first so the refresh token cannot be replayed.
  await backendAuth.logout(env.apiBaseUrl, refreshToken);

  const response = NextResponse.json({ success: true, message: "Logged out successfully", data: null });
  clearSessionCookies(response.cookies);
  return response;
}
