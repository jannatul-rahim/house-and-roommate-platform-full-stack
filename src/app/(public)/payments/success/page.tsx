import { CheckCircle2, Clock, CreditCard, Home, Receipt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PaymentStatusRefresher } from "@/components/dashboard/payment-status-refresher";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/types/api";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your NestMate rent payment was completed through Stripe.",
  robots: { index: false },
};

async function findPayment(sessionId: string | undefined): Promise<Payment | null> {
  if (!sessionId) return null;
  const user = await getSession();
  if (!user?.roles.includes("TENANT")) return null;
  const { data } = await serverApi
    .list<Payment>("/payments/my-payments", { auth: true, query: { limit: 25, sortBy: "createdAt", sortOrder: "desc" } })
    .catch(() => ({ data: [] as Payment[] }));
  return data.find((p) => p.providerSessionId === sessionId) ?? null;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payments/success">) {
  const { session_id } = await searchParams;
  const sessionId = typeof session_id === "string" ? session_id : undefined;
  const payment = await findPayment(sessionId);
  const confirmed = payment?.status === "PAID";
  const property = payment?.lease.room.unit.building.property;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg space-y-6 rounded-3xl border bg-card p-8 text-center shadow-xl shadow-primary/5">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${confirmed || !payment ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
        >
          {confirmed || !payment ? <CheckCircle2 className="size-8" aria-hidden /> : <Clock className="size-8" aria-hidden />}
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{confirmed ? "Payment received!" : "Payment submitted"}</h1>
          <p className="text-muted-foreground">
            {confirmed
              ? "Thank you — your rent has been paid and your landlord has been notified."
              : "Stripe accepted your card. We're recording the payment against your lease."}
          </p>
        </div>

        {payment ? (
          <dl className="space-y-3 rounded-2xl bg-muted/50 p-5 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-heading text-lg font-bold text-primary">{formatCurrency(payment.amount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Property</dt>
              <dd className="text-right font-medium">{property?.title ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Room</dt>
              <dd className="font-medium">Room {payment.lease.room.roomNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Initiated</dt>
              <dd className="font-medium">{formatDateTime(payment.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge status={payment.status} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="flex items-center gap-1 font-medium">
                <CreditCard className="size-4" aria-hidden /> Card via Stripe
              </dd>
            </div>
          </dl>
        ) : (
          <p className="rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">
            {sessionId
              ? "Sign in with the tenant account that made this payment to see the receipt."
              : "Your payment details are available in your dashboard."}
          </p>
        )}

        {payment && !confirmed && <PaymentStatusRefresher />}

        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/dashboard/payments">
              <Receipt /> View payment history
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Home /> Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
