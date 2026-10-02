import { humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tone = "green" | "amber" | "red" | "blue" | "gray" | "violet";

// One place that decides the colour of every status the API can return.
const STATUS_TONE: Record<string, Tone> = {
  // positive
  PUBLISHED: "green",
  AVAILABLE: "green",
  APPROVED: "green",
  ACTIVE: "green",
  PAID: "green",
  RESOLVED: "green",
  COMPLETED: "green",
  // in-flight
  PENDING: "amber",
  PROCESSING: "blue",
  UNDER_REVIEW: "blue",
  IN_PROGRESS: "blue",
  OPEN: "amber",
  RESERVED: "violet",
  PARTIALLY_PAID: "violet",
  PARTIALLY_OCCUPIED: "violet",
  DRAFT: "gray",
  // negative / closed
  REJECTED: "red",
  FAILED: "red",
  OVERDUE: "red",
  LATE: "red",
  URGENT: "red",
  TERMINATED: "red",
  CANCELLED: "gray",
  WITHDRAWN: "gray",
  EXPIRED: "gray",
  CLOSED: "gray",
  ARCHIVED: "gray",
  UNPUBLISHED: "gray",
  UNAVAILABLE: "gray",
  OCCUPIED: "blue",
  FULLY_OCCUPIED: "blue",
  MAINTENANCE: "amber",
  REFUNDED: "violet",
  // priorities
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "amber",
};

const toneClasses: Record<Tone, string> = {
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-300",
  amber: "bg-amber-500/10 text-amber-700 ring-amber-600/20 dark:text-amber-300",
  red: "bg-rose-500/10 text-rose-700 ring-rose-600/20 dark:text-rose-300",
  blue: "bg-sky-500/10 text-sky-700 ring-sky-600/20 dark:text-sky-300",
  gray: "bg-muted text-muted-foreground ring-border",
  violet: "bg-violet-500/10 text-violet-700 ring-violet-600/20 dark:text-violet-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "gray";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {humanize(status)}
    </span>
  );
}
