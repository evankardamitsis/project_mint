"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { adminUpdateOrderStatusAction } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { OrderStatus, PaymentStatus } from "@/types/domain";

const orderStatuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "cleared_for_shipping",
  "shipped",
  "delivered",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
];

const paymentStatuses: PaymentStatus[] = [
  "unpaid",
  "authorized",
  "paid",
  "held",
  "released",
  "refunded",
];

export function AdminOrderStatusForm({
  orderId,
  initialStatus,
  initialPayment,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  initialPayment: PaymentStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [payment, setPayment] = useState<PaymentStatus>(initialPayment);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4">
      <p className="text-sm font-medium">Admin: order state</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="admin-order-status">Order status</Label>
          <select
            id="admin-order-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {orderStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-payment-status">Payment status</Label>
          <select
            id="admin-payment-status"
            value={payment}
            onChange={(e) => setPayment(e.target.value as PaymentStatus)}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await adminUpdateOrderStatusAction(orderId, status, payment);
            if (!r.ok) {
              setError(r.error ?? "Update failed.");
              return;
            }
            router.refresh();
          })
        }
      >
        {pending ? "Saving…" : "Save status"}
      </Button>
    </div>
  );
}
