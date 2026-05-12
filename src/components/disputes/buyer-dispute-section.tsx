import Link from "next/link";

import { DisputeStatusBadge } from "@/components/disputes/dispute-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { orderAllowsNewDispute, pickActiveDispute } from "@/lib/disputes/eligibility";
import type { DisputeStatus } from "@/types/domain";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dispute</CardTitle>
        <CardDescription>Report an issue after delivery. Refunds are placeholder until Stripe is connected.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeExists && active ? (
          <div className="flex flex-wrap items-center gap-3">
            <DisputeStatusBadge status={active.status as DisputeStatus} />
            <Button size="sm" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View dispute
            </Button>
          </div>
        ) : null}
        {!activeExists && hasDisputeHistory ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Dispute case on file</span>
            <Button size="sm" variant="outline" render={<Link href={`/buyer/purchases/${order.id}/dispute`} />}>
              View case
            </Button>
          </div>
        ) : null}
        {canOpen ? (
          <Button render={<Link href={`/buyer/purchases/${order.id}/dispute/new`} />}>Report an issue</Button>
        ) : null}
        {!activeExists && !canOpen && order.status === "pending_payment" ? (
          <p className="text-xs text-muted-foreground">Disputes are available after checkout and shipment.</p>
        ) : null}
        {showPaymentHint ? (
          <p className="text-xs text-muted-foreground">
            Disputes require payment to be held or marked paid. Complete demo checkout first if you have not.
          </p>
        ) : null}
        {!activeExists && !canOpen && (order.status === "cancelled" || order.status === "refunded") ? (
          <p className="text-xs text-muted-foreground">This order cannot be disputed.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
