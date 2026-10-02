import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { env } from "@/lib/env";

/**
 * Backend-for-frontend proxy. Browser code calls `/api/proxy/<api path>`;
 * we attach the HttpOnly access token as a Bearer header and stream the
 * API response back. Tokens therefore never touch client-side JavaScript,
 * and CORS is irrelevant because the browser only talks to this origin.
 *
 * A 401 is passed through untouched - the client performs one shared
 * refresh and retries (see lib/api/client.ts).
 */
const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "idempotency-key"];

async function forward(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await ctx.params;
  const target = `${env.apiBaseUrl}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json(
      { success: false, statusCode: 503, message: "We couldn't reach the NestMate API. Please try again shortly." },
      { status: 503 },
    );
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
