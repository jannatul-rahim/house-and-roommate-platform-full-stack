"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Stripe confirms the payment to the API via webhook, which can land a few
 * seconds after the redirect. Re-render the server page until it does.
 */
export function PaymentStatusRefresher({ maxAttempts = 6 }: { maxAttempts?: number }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (attempt >= maxAttempts) return;
    const timer = setTimeout(() => {
      router.refresh();
      setAttempt((a) => a + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [attempt, maxAttempts, router]);

  return attempt < maxAttempts ? (
    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
      <Loader2 className="size-4 animate-spin" aria-hidden /> Waiting for Stripe to confirm your payment…
    </p>
  ) : (
    <p className="text-sm text-muted-foreground">
      Stripe is still confirming this payment. It will update automatically in your payment history.
    </p>
  );
}
