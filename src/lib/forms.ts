import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/errors";

/**
 * Maps the API's `errors: [{ path, message }]` onto form fields so server-side
 * validation shows inline exactly like client-side validation. Returns true if
 * at least one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!(error instanceof ApiError)) return false;
  let applied = false;
  for (const issue of error.errors) {
    const field = issue.path.split(".")[0];
    if (fields.includes(field)) {
      setError(field as Path<T>, { type: "server", message: issue.message });
      applied = true;
    }
  }
  return applied;
}
