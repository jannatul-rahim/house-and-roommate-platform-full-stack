import "server-only";
import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import type { BackendAuthResult } from "./backend";
import { setSessionCookies } from "./cookies";

/** Sets our own HttpOnly session cookies and returns the user (never the tokens). */
export function sessionResponse(result: BackendAuthResult, status = 200) {
  const response = NextResponse.json({ success: true, data: { user: result.user } }, { status });
  setSessionCookies(response.cookies, result);
  return response;
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, statusCode: error.status, message: error.message, errors: error.errors },
      { status: error.status },
    );
  }
  return NextResponse.json(
    { success: false, statusCode: 503, message: "We couldn't reach the NestMate API. Please try again shortly." },
    { status: 503 },
  );
}
