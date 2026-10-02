import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { backendAuth } from "@/lib/auth/backend";
import { errorResponse, sessionResponse } from "@/lib/auth/route-helpers";
import { env } from "@/lib/env";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ApiError(400, "Please provide a valid email and password");
    const result = await backendAuth.login(env.apiBaseUrl, parsed.data.email, parsed.data.password);
    return sessionResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
