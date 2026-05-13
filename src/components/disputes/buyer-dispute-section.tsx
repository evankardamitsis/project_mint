import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card id="get-help" className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-ink">Get help</CardTitle>
        <CardDescription>Something not right after delivery? Open a case and we will review it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeExists && active ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm capitalize text-(--color-text-muted)">Case · {String(active.status).replace(/_/g, " ")}</span>
            <Button size="sm" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View case
            </Button>
          </div>
        ) : null}
        {!activeExists && hasDisputeHistory ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-(--color-text-muted)">You have a case on file</span>
            <Button size="sm" variant="outline" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View case
            </Button>
          </div>
        ) : null}
        {canOpen ? (
          <Button render={<Link href={`/buyer/purchases/${order.id}/dispute/new`} />}>Get help with this order</Button>
        ) : null}
        {!activeExists && !canOpen && order.status === "pending_payment" ? (
          <p className="text-xs text-(--color-text-muted)">Help is available after checkout and shipment.</p>
        ) : null}
        {showPaymentHint ? (
          <p className="text-xs text-(--color-text-muted)">
            Complete checkout so payment can be held — then you can reach out if needed.
          </p>
        ) : null}
        {!activeExists && !canOpen && (order.status === "cancelled" || order.status === "refunded") ? (
          <p className="text-xs text-(--color-text-muted)">This order is closed — help is not available.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
