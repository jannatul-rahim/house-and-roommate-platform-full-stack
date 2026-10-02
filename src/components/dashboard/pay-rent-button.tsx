"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayRent } from "@/hooks/use-pay-rent";
import { formatCurrency } from "@/lib/format";

export function PayRentButton({ leaseId, amount, size = "default", className }: { leaseId: string; amount: number; size?: "default" | "sm" | "lg"; className?: string }) {
  const pay = usePayRent();
  return (
    <Button size={size} className={className} onClick={() => pay.mutate(leaseId)} disabled={pay.isPending || pay.isSuccess}>
      {pay.isPending || pay.isSuccess ? <Loader2 className="animate-spin" /> : <CreditCard />}
      Pay {formatCurrency(amount)}
    </Button>
  );
}
