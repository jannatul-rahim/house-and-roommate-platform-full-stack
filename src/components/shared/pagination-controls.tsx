"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/use-query-params";
import type { ApiMeta } from "@/types/api";

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/** Page navigation that writes `?page=N` to the URL. */
export function PaginationControls({ meta, itemLabel = "results" }: { meta: ApiMeta; itemLabel?: string }) {
  const { setParams } = useQueryParams();
  if (meta.total === 0) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);
  const goTo = (page: number) => {
    setParams({ page: page === 1 ? null : page }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{meta.total}</span> {itemLabel}
      </p>
      {meta.totalPage > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => goTo(meta.page - 1)} disabled={meta.page <= 1} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          {pageWindow(meta.page, meta.totalPage).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === meta.page ? "default" : "ghost"}
                size="icon"
                onClick={() => goTo(p)}
                aria-current={p === meta.page ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(meta.page + 1)}
            disabled={meta.page >= meta.totalPage}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </nav>
  );
}
