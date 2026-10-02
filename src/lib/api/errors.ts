import type { ApiErrorSource } from "@/types/api";

/** Normalized error thrown by both the server and the browser API clients. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorSource[];

  constructor(status: number, message: string, errors: ApiErrorSource[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/** Best human-readable message for a toast. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    // "Validation failed" alone is unhelpful - surface the first field issue.
    if (error.errors.length && error.message === "Validation failed") {
      return error.errors[0].message;
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
