import { ApiError } from "@/lib/api/errors";
import { backendAuth } from "@/lib/auth/backend";
import { errorResponse, sessionResponse } from "@/lib/auth/route-helpers";
import { env } from "@/lib/env";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const parsed = registerSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      throw new ApiError(
        400,
        "Validation failed",
        parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      );
    }
    const { confirmPassword: _confirm, phone, ...rest } = parsed.data;
    const result = await backendAuth.register(env.apiBaseUrl, { ...rest, phone: phone || undefined });
    return sessionResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
