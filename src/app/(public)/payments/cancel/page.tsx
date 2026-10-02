import { ArrowLeft, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your Stripe checkout was cancelled. No money was taken.",
  robots: { index: false },
};

export default function PaymentCancelPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border bg-card p-8 text-center shadow-xl shadow-primary/5">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
          <XCircle className="size-8" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Payment cancelled</h1>
          <p className="text-muted-foreground">
            You left Stripe checkout before paying, so <strong>no money was taken</strong>. Your lease is unchanged and you
            can pay whenever you&apos;re ready.
          </p>
        </div>
        <ul className="space-y-2 rounded-2xl bg-muted/50 p-5 text-left text-sm text-muted-foreground">
          <li className="flex gap-2">
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            The unfinished attempt may appear as &quot;Processing&quot; in your history until Stripe expires the session.
          </li>
          <li className="flex gap-2">
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            Card declined? Try another card or contact your bank, then start a new payment.
          </li>
        </ul>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/leases">
              <RotateCcw /> Try again
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft /> Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
