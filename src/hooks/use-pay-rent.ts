"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { CreatePaymentResult } from "@/types/api";

/**
 * Starts a Stripe Checkout session for one month's rent and redirects to it.
 * Stripe sends the tenant back to /payments/success or /payments/cancel.
 */
export function usePayRent() {
  return useMutation({
    mutationFn: (leaseId: string) =>
      api.post<CreatePaymentResult>("/payments", { leaseId }, { "Idempotency-Key": crypto.randomUUID() }),
    onSuccess: (result) => {
      if (!result.checkoutUrl) {
        toast.error("Stripe did not return a checkout link. Please try again.");
        return;
      }
      toast.loading("Redirecting to secure Stripe checkout…");
      window.location.assign(result.checkoutUrl);
    },
  });
}
