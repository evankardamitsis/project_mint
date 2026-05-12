import Link from "next/link";

import { DisputeStatusBadge } from "@/components/disputes/dispute-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetail } from "@/types/orders";

export function OrderDisputeLinkCard({ order, href }: { order: OrderDetail; href: string }) {
  const show = order.status === "disputed" || order.active_dispute != null;
  if (!show) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dispute</CardTitle>
        <CardDescription>
          Evidence, responses, and admin decisions live on the dispute page. Money movement is placeholder until Stripe is
          connected.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {order.active_dispute ? (
          <DisputeStatusBadge status={order.active_dispute.status} />
        ) : (
          <span className="text-sm text-muted-foreground">No active workflow — case file available</span>
        )}
        <Button size="sm" render={<Link href={href} />}>
          Open dispute
        </Button>
      </CardContent>
    </Card>
  );
}
