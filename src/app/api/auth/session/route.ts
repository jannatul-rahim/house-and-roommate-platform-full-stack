import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/** Lightweight "who am I" for client components (navbar, menus). */
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ success: true, data: user });
}
