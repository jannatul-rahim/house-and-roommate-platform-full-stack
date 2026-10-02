"use client";

import { ErrorState } from "@/components/shared/error-state";

/** Route-level error boundary for every page without a closer one. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-page flex flex-1 items-center justify-center">
      <ErrorState error={error} reset={reset} />
    </main>
  );
}
