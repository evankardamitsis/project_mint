import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/types/orders";

export function OrderDisputeLinkCard({ order, href }: { order: OrderDetail; href: string }) {
  const show = order.has_dispute || order.status === "disputed" || order.active_dispute != null;
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-2xl border-l-4 border-l-[var(--color-danger-text)]/35 bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Case file</p>
      <p className="mt-2 text-base font-semibold text-[#111111]">This order has an open or past dispute</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Evidence and messages stay on the case page. Payout actions are placeholders until Stripe is connected.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {order.active_dispute ? (
          <span className="text-sm capitalize text-[var(--color-text-secondary)]">
            Status: {String(order.active_dispute.status).replace(/_/g, " ")}
          </span>
        ) : (
          <span className="text-sm text-[var(--color-text-secondary)]">Review the case file for history.</span>
        )}
        <Button size="sm" variant="outline" className="border-[#e0ddd8]" render={<Link href={href} />}>
          View case
        </Button>
      </div>
    </div>
  );
}
