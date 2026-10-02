import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { backendAuth } from "@/lib/auth/backend";
import { errorResponse, sessionResponse } from "@/lib/auth/route-helpers";
import { env } from "@/lib/env";

const bodySchema = z.object({ role: z.enum(["ADMIN", "OWNER", "TENANT"]) });

/**
 * One-click demo login. Demo credentials live in server env vars so they are
 * never bundled into client JavaScript.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "Unknown demo role");

    const credentials = env.demo[parsed.data.role];
    if (!credentials.email || !credentials.password) {
      throw new ApiError(503, "This demo account is not configured on the server.");
    }

    const result = await backendAuth.login(env.apiBaseUrl, credentials.email, credentials.password);
    return sessionResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
