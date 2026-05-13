import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { orderAllowsNewDispute, pickActiveDispute } from "@/lib/disputes/eligibility";
import type { OrderDetail } from "@/types/orders";

export async function BuyerDisputeSection({ order }: { order: OrderDetail }) {
  const supabase = await createClient();
  const { data: statusRows } = await supabase.from("disputes").select("id, status").eq("order_id", order.id);
  const active = pickActiveDispute(statusRows ?? []);
  const activeExists = Boolean(active);
  const hasDisputeHistory = (statusRows ?? []).length > 0;
  const canOpen = orderAllowsNewDispute(order) && !activeExists;

  const showPaymentHint =
    !activeExists &&
    !canOpen &&
    (order.status === "shipped" || order.status === "delivered" || order.status === "completed") &&
    order.payment_status !== "held" &&
    order.payment_status !== "paid";

  return (
    <div id="get-help" className="rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Help</p>
      <p className="mt-2 text-base font-semibold text-[#111111]">Get help with this order</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Something not right after delivery? Open a case — we review with your photos and tracking.
      </p>
      <div className="mt-5 space-y-3">
        {activeExists && active ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm capitalize text-[var(--color-text-muted)]">Case · {String(active.status).replace(/_/g, " ")}</span>
            <Button size="sm" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View case
            </Button>
          </div>
        ) : null}
        {!activeExists && hasDisputeHistory ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">You have a case on file</span>
            <Button size="sm" variant="outline" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View case
            </Button>
          </div>
        ) : null}
        {canOpen ? (
          <Button render={<Link href={`/buyer/purchases/${order.id}/dispute/new`} />}>Get help with this order</Button>
        ) : null}
        {!activeExists && !canOpen && order.status === "pending_payment" ? (
          <p className="text-xs text-[var(--color-text-muted)]">Help is available after checkout and shipment.</p>
        ) : null}
        {showPaymentHint ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            Complete checkout so payment can be held — then you can reach out if needed.
          </p>
        ) : null}
        {!activeExists && !canOpen && (order.status === "cancelled" || order.status === "refunded") ? (
          <p className="text-xs text-[var(--color-text-muted)]">This order is closed — help is not available.</p>
        ) : null}
      </div>
    </div>
  );
}
