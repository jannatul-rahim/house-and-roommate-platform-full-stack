import type { ApiErrorBody, ApiResponse, AuthResult, AuthUser, Role } from "@/types/api";
import { ApiError } from "@/lib/api/errors";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface BackendAuthResult extends SessionTokens {
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Exclude<Role, "ADMIN">;
}

/**
 * The API delivers the refresh token only as an HttpOnly `refreshToken`
 * cookie. Pull it out of Set-Cookie so we can re-issue it on our own origin.
 */
function extractRefreshToken(res: Response): string | null {
  for (const header of res.headers.getSetCookie()) {
    const match = /^refreshToken=([^;]+)/.exec(header);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

async function authRequest(apiBaseUrl: string, path: string, body: unknown): Promise<BackendAuthResult> {
  const res = await fetch(`${apiBaseUrl}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<AuthResult> | ApiErrorBody | null;

  if (!res.ok || !json || !json.success) {
    const err = json as ApiErrorBody | null;
    throw new ApiError(res.status, err?.message ?? "Authentication failed", err?.errors ?? []);
  }

  const refreshToken = extractRefreshToken(res);
  if (!refreshToken) throw new ApiError(502, "The server did not return a session. Please try again.");

  return { user: json.data.user, accessToken: json.data.accessToken, refreshToken };
}

export const backendAuth = {
  login: (apiBaseUrl: string, email: string, password: string) =>
    authRequest(apiBaseUrl, "login", { email, password }),
  register: (apiBaseUrl: string, input: RegisterInput) => authRequest(apiBaseUrl, "register", input),
  refresh: (apiBaseUrl: string, refreshToken: string) =>
    authRequest(apiBaseUrl, "refresh-token", { refreshToken }),
  logout: async (apiBaseUrl: string, refreshToken: string | undefined) => {
    if (!refreshToken) return;
    // The API reads the token from its cookie, so forward it that way.
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${encodeURIComponent(refreshToken)}` },
      cache: "no-store",
    }).catch(() => undefined);
  },
};
