import Image from "next/image";
import Link from "next/link";

import { orderTotalCents } from "@/lib/orders/fees";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/types/orders";

export function OrderSummary({
  order,
  listingHref,
  partyEmphasis,
}: {
  order: OrderDetail;
  listingHref?: string;
  /** Highlight the other party under the listing title (buyer vs seller context). */
  partyEmphasis?: "buyer" | "seller";
}) {
  const total = orderTotalCents(order.amount_cents, order.platform_fee_cents, order.protected_delivery_fee_cents);
  const buyerLabel = order.buyer_full_name?.trim() || order.buyer_email?.trim() || "Buyer";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.payment_status} />
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 sm:flex-row sm:items-start">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          {order.listing_image_url ? (
            <Image src={order.listing_image_url} alt="" fill className="object-cover" sizes="96px" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium leading-snug">{order.listing_title}</p>
          {partyEmphasis === "seller" ? (
            <p className="text-sm text-muted-foreground">
              Seller: <span className="font-medium text-foreground">{order.seller_display_name}</span>
            </p>
          ) : partyEmphasis === "buyer" ? (
            <p className="text-sm text-muted-foreground">
              Buyer: <span className="font-medium text-foreground">{buyerLabel}</span>
            </p>
          ) : null}
          {listingHref ? (
            <Button variant="link" size="sm" className="h-auto p-0" render={<Link href={listingHref} />}>
              View listing
            </Button>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>
      <dl className="grid gap-3 rounded-xl border border-border/80 bg-muted/20 p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Item</dt>
          <dd>
            <Price amountCents={order.amount_cents} currency={order.currency} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Platform fee (5%)</dt>
          <dd>
            <Price amountCents={order.platform_fee_cents} currency={order.currency} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Protected delivery</dt>
          <dd>
            <Price amountCents={order.protected_delivery_fee_cents} currency={order.currency} />
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-3 font-medium">
          <dt>Total</dt>
          <dd>
            <Price amountCents={total} currency={order.currency} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
