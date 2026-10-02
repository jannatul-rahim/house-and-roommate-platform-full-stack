import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth/constants";
import { env } from "@/lib/env";
import type { ApiErrorBody, ApiResponse, Paginated } from "@/types/api";
import { ApiError } from "./errors";
import { buildQueryString, type QueryValue } from "./query";

interface ServerFetchOptions {
  query?: Record<string, QueryValue>;
  /** Attach the signed-in user's access token. Defaults to false so public pages stay cacheable. */
  auth?: boolean;
  /** ISR window for public data. Ignored for authenticated requests. */
  revalidate?: number;
}

async function request<T>(path: string, options: ServerFetchOptions = {}, attempt = 1): Promise<ApiResponse<T>> {
  const headers: HeadersInit = { Accept: "application/json" };
  if (options.auth) {
    const token = (await cookies()).get(ACCESS_COOKIE)?.value;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${env.apiBaseUrl}${path}${buildQueryString(options.query)}`, {
      headers,
      ...(options.auth
        ? { cache: "no-store" as const }
        : { next: { revalidate: options.revalidate ?? 60 } }),
    });
  } catch {
    throw new ApiError(503, "We couldn't reach the NestMate API. Please try again shortly.");
  }

  // The API's connection pool occasionally times out under bursts; retry once.
  if (res.status >= 500 && attempt < 2) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return request<T>(path, options, attempt + 1);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | ApiErrorBody | null;
  if (!res.ok || !json || !json.success) {
    const err = json as ApiErrorBody | null;
    throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.errors ?? []);
  }
  return json;
}

/** Fetch helpers for Server Components. */
export const serverApi = {
  async get<T>(path: string, options?: ServerFetchOptions): Promise<T> {
    return (await request<T>(path, options)).data;
  },
  async list<T>(path: string, options?: ServerFetchOptions): Promise<Paginated<T>> {
    const json = await request<T[]>(path, options);
    return {
      data: json.data,
      meta: json.meta ?? { page: 1, limit: json.data.length, total: json.data.length, totalPage: 1 },
    };
  },
};

/**
 * Runs loaders with limited concurrency. The API wraps every list in a DB
 * transaction and its pool is small, so firing many at once can time out.
 */
export async function loadAll<T extends readonly (() => Promise<unknown>)[]>(
  loaders: T,
  concurrency = 3,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results: unknown[] = new Array(loaders.length);
  let next = 0;
  async function worker() {
    while (next < loaders.length) {
      const index = next++;
      results[index] = await loaders[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, loaders.length) }, worker));
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
