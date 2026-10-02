import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

const currencyFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
});

/** Formats a BDT amount; accepts numbers or the API's decimal strings. */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const amount = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : "—";
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(value: string | Date | null | undefined, pattern = "d MMM yyyy"): string {
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "d MMM yyyy, h:mm a");
}

export function formatRelative(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

/** "PARTIALLY_OCCUPIED" -> "Partially occupied" */
export function humanize(value: string | null | undefined): string {
  if (!value) return "—";
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Converts an `<input type="date">` value to the ISO datetime the API requires. */
export function dateInputToIso(value: string, endOfDay = false): string {
  return new Date(`${value}T${endOfDay ? "23:59:59" : "00:00:00"}`).toISOString();
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function locationLine(parts: { city?: string | null; state?: string | null; country?: string | null }) {
  return [parts.city, parts.state, parts.country].filter(Boolean).join(", ");
}
