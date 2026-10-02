"use client";

import type { ApiErrorBody, ApiResponse, Paginated } from "@/types/api";
import { ApiError } from "./errors";
import { buildQueryString, type QueryValue } from "./query";

interface ClientRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, string>;
}

// Single-flight refresh: when several queries hit a 401 at once they must
// share ONE refresh call. The API rotates refresh tokens and treats reuse of a
// rotated token as theft (revoking every session), so parallel refreshes would
// log the user out.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function send(path: string, options: ClientRequestOptions): Promise<Response> {
  const isFormData = options.body instanceof FormData;
  return fetch(`/api/proxy${path}${buildQueryString(options.query)}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body !== undefined && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    body:
      options.body === undefined
        ? undefined
        : isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });
}

async function request<T>(path: string, options: ClientRequestOptions = {}): Promise<ApiResponse<T>> {
  let res = await send(path, options);

  if (res.status === 401 && (await refreshSession())) {
    res = await send(path, options);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | ApiErrorBody | null;
  if (!res.ok || !json || !json.success) {
    const err = json as ApiErrorBody | null;
    if (res.status === 401 && typeof window !== "undefined") {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      // Full reload on purpose: it drops every cached query of the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`/login?redirect=${redirect}&expired=1`);
    }
    throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.errors ?? []);
  }
  return json;
}

/** Browser API client - every call goes through the authenticated `/api/proxy`. */
export const api = {
  async get<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    return (await request<T>(path, { query })).data;
  },
  async list<T>(path: string, query?: Record<string, QueryValue>): Promise<Paginated<T>> {
    const json = await request<T[]>(path, { query });
    return {
      data: json.data,
      meta: json.meta ?? { page: 1, limit: json.data.length, total: json.data.length, totalPage: 1 },
    };
  },
  async post<T>(path: string, body: unknown = {}, headers?: Record<string, string>): Promise<T> {
    return (await request<T>(path, { method: "POST", body, headers })).data;
  },
  async patch<T>(path: string, body: unknown = {}): Promise<T> {
    return (await request<T>(path, { method: "PATCH", body })).data;
  },
  async put<T>(path: string, body: unknown): Promise<T> {
    return (await request<T>(path, { method: "PUT", body })).data;
  },
  async delete<T>(path: string): Promise<T> {
    return (await request<T>(path, { method: "DELETE" })).data;
  },
};
