import Image from "next/image";
import Link from "next/link";

import { orderTotalCents } from "@/lib/orders/fees";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import type { OrderDetail } from "@/types/orders";

function humanize(status: string) {
  return status.replace(/_/g, " ");
}

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
    <div className="overflow-hidden rounded-2xl bg-[var(--color-background-surface)] shadow-sm ring-1 ring-[#e0ddd8]/80">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
        <div className="relative mx-auto size-28 shrink-0 overflow-hidden rounded-xl bg-[var(--color-background-page)] sm:mx-0 sm:size-32">
          {order.listing_image_url ? (
            <Image src={order.listing_image_url} alt="" fill className="object-cover" sizes="128px" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Listing</p>
            <p className="mt-1 text-lg font-semibold leading-snug text-[#111111]">{order.listing_title}</p>
          </div>
          {partyEmphasis === "seller" ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Seller <span className="font-semibold text-[#111111]">{order.seller_display_name}</span>
            </p>
          ) : partyEmphasis === "buyer" ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Buyer <span className="font-semibold text-[#111111]">{buyerLabel}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-md bg-[var(--color-background-page)] px-2 py-1 text-xs font-medium capitalize text-[var(--color-text-secondary)]">
              {humanize(order.status)}
            </span>
            <span className="rounded-md bg-mint-tint px-2 py-1 text-xs font-medium capitalize text-mint-dark">
              {humanize(order.payment_status)}
            </span>
          </div>
          {listingHref ? (
            <Button variant="outline" size="sm" className="border-[#e0ddd8]" render={<Link href={listingHref} />}>
              View listing
            </Button>
          ) : null}
          <p className="text-xs text-[var(--color-text-muted)]">
            Placed {new Date(order.created_at).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="w-full shrink-0 text-center sm:w-auto sm:pt-1 sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Total</p>
          <Price amountCents={total} currency={order.currency} className="mt-1 text-2xl font-black tracking-tight text-[#111111]" />
        </div>
      </div>
      <div className="grid gap-0 border-t border-[#e0ddd8]/60 bg-[var(--color-background-page)]/40 px-5 py-4 text-sm sm:grid-cols-3">
        <div className="flex justify-between gap-3 py-2 sm:block sm:py-0">
          <span className="text-[var(--color-text-secondary)]">Item</span>
          <Price amountCents={order.amount_cents} currency={order.currency} className="font-semibold text-[#111111]" />
        </div>
        <div className="flex justify-between gap-3 border-t border-[#e0ddd8]/50 py-2 sm:block sm:border-t-0 sm:border-l sm:px-4 sm:py-0">
          <span className="text-[var(--color-text-secondary)]">Platform (5%)</span>
          <Price amountCents={order.platform_fee_cents} currency={order.currency} className="font-semibold text-[#111111]" />
        </div>
        <div className="flex justify-between gap-3 border-t border-[#e0ddd8]/50 py-2 sm:block sm:border-t-0 sm:border-l sm:px-4 sm:py-0">
          <span className="text-[var(--color-text-secondary)]">Protected delivery</span>
          <Price amountCents={order.protected_delivery_fee_cents} currency={order.currency} className="font-semibold text-[#111111]" />
        </div>
      </div>
    </div>
  );
}
