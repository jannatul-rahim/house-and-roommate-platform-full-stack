import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/errors";
import { backendAuth } from "@/lib/auth/backend";
import { REFRESH_COOKIE } from "@/lib/auth/constants";
import { clearSessionCookies } from "@/lib/auth/cookies";
import { errorResponse, sessionResponse } from "@/lib/auth/route-helpers";
import { env } from "@/lib/env";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  try {
    if (!refreshToken) throw new ApiError(401, "Your session has expired. Please log in again.");
    const result = await backendAuth.refresh(env.apiBaseUrl, refreshToken);
    return sessionResponse(result);
  } catch (error) {
    const response = errorResponse(error);
    if (error instanceof ApiError && error.status === 401) clearSessionCookies(response.cookies);
    return response;
  }
}
