import { format, startOfMonth, subMonths } from "date-fns";
import { humanize } from "@/lib/format";
import type { Payment } from "@/types/api";

/** Paid rent per month for the last `months` months (zero-filled). */
export function revenueByMonth(payments: Payment[], months = 6) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = startOfMonth(subMonths(new Date(), months - 1 - i));
    return { key: format(d, "yyyy-MM"), label: format(d, "MMM"), value: 0 };
  });
  for (const p of payments) {
    if (p.status !== "PAID") continue;
    const key = format(new Date(p.paidAt ?? p.createdAt), "yyyy-MM");
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.value += p.amount;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

/** Count of items per value of `pick`, in the given order. */
export function countBy<T>(items: T[], pick: (item: T) => string, order: readonly string[]) {
  return order.map((key) => ({ label: humanize(key), value: items.filter((i) => pick(i) === key).length }));
}
