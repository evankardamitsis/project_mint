import Image from "next/image";
import Link from "next/link";

import { orderTotalCents } from "@/lib/orders/fees";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DisputeStatusBadge } from "@/components/disputes/dispute-status-badge";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { PaymentStatusBadge } from "@/components/orders/payment-status-badge";
import { ProtectedDeliveryStatusBadge } from "@/components/protected-delivery/protected-delivery-status-badge";
import { cn } from "@/lib/utils";
import type { OrderListRow } from "@/types/orders";
import type { PaymentStatus } from "@/types/domain";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function humanizeStatus(status: string) {
  return status.replace(/_/g, " ");
}

function paymentPhrase(status: PaymentStatus): string {
  switch (status) {
    case "unpaid":
      return "Awaiting checkout";
    case "authorized":
      return "Authorized";
    case "paid":
      return "Paid";
    case "held":
      return "Payment protected";
    case "released":
      return "Released to seller";
    case "refunded":
      return "Refunded";
    default:
      return humanizeStatus(status);
  }
}

export function OrderDashboardTable({
  rows,
  detailHref,
  disputeHref,
}: {
  rows: OrderListRow[];
  detailHref: (id: string) => string;
  disputeHref?: (id: string) => string;
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-border/70 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14" />
            <TableHead>Listing</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Protected Delivery</TableHead>
            <TableHead>Dispute</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const total = orderTotalCents(row.amount_cents, row.platform_fee_cents, row.protected_delivery_fee_cents);
            const showDispute = row.has_dispute || row.status === "disputed" || row.active_dispute != null;
            const dHref = showDispute && disputeHref ? disputeHref(row.id) : null;
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {row.listing_image_url ? (
                      <Image src={row.listing_image_url} alt="" fill className="object-cover" sizes="40px" />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] font-medium">{row.listing_title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.counterparty_label}</TableCell>
                <TableCell>
                  <Price amountCents={total} currency={row.currency} className="text-sm" />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={row.payment_status} />
                </TableCell>
                <TableCell>
                  <ProtectedDeliveryStatusBadge status={row.pd_check_status} />
                </TableCell>
                <TableCell>
                  {showDispute ? (
                    <div className="flex flex-col items-start gap-1">
                      {row.active_dispute ? <DisputeStatusBadge status={row.active_dispute.status} /> : (
                        <span className="text-xs text-muted-foreground">Disputed</span>
                      )}
                      {dHref ? (
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" render={<Link href={dHref} />}>
                          Case file
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatWhen(row.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" render={<Link href={detailHref(row.id)} />}>
                    View order
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function OrderDashboardCards({
  rows,
  detailHref,
  disputeHref,
  stack = "responsive",
}: {
  rows: OrderListRow[];
  detailHref: (id: string) => string;
  disputeHref?: (id: string) => string;
  /** `always` = card grid on all breakpoints (buyer/seller). `responsive` = mobile-only when paired with table (admin). */
  stack?: "responsive" | "always";
}) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div
      className={cn(
        stack === "always" ? "grid gap-4 sm:grid-cols-2" : "space-y-4 md:hidden",
      )}
    >
      {rows.map((row) => {
        const total = orderTotalCents(row.amount_cents, row.platform_fee_cents, row.protected_delivery_fee_cents);
        const showDispute = row.has_dispute || row.status === "disputed" || row.active_dispute != null;
        const dHref = showDispute && disputeHref ? disputeHref(row.id) : null;
        const isMarketplace = stack === "always";

        if (!isMarketplace) {
          return (
            <div key={row.id} className="space-y-3 rounded-2xl border border-border/70 bg-card/90 p-4">
              <div className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {row.listing_image_url ? (
                    <Image src={row.listing_image_url} alt="" fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium leading-snug">{row.listing_title}</p>
                  <p className="text-sm text-muted-foreground">{row.counterparty_label}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={row.status} />
                    <PaymentStatusBadge status={row.payment_status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Protected Delivery</span>
                    <ProtectedDeliveryStatusBadge status={row.pd_check_status} />
                  </div>
                  {showDispute ? (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Dispute</span>
                      {row.active_dispute ? <DisputeStatusBadge status={row.active_dispute.status} /> : (
                        <span className="text-muted-foreground">Disputed</span>
                      )}
                      {dHref ? (
                        <Link href={dHref} className="font-medium text-foreground underline underline-offset-2">
                          Case file
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="text-sm">
                    Total <Price amountCents={total} currency={row.currency} />
                  </p>
                  <p className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" render={<Link href={detailHref(row.id)} />}>
                View order
              </Button>
            </div>
          );
        }

        return (
          <article
            key={row.id}
            className="flex flex-col overflow-hidden rounded-2xl bg-[var(--color-background-surface)] shadow-sm ring-1 ring-[#e0ddd8]/80"
          >
            <div className="flex gap-4 p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-background-page)]">
                {row.listing_image_url ? (
                  <Image src={row.listing_image_url} alt="" fill className="object-cover" sizes="80px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-[#111111]">{row.listing_title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{row.counterparty_label}</p>
                <Price amountCents={total} currency={row.currency} className="mt-2 text-lg font-black tracking-tight text-[#111111]" />
                <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                  <span className="capitalize text-[#111111]/80">{humanizeStatus(row.status)}</span>
                  <span className="text-[var(--color-text-muted)]"> · </span>
                  <span>{paymentPhrase(row.payment_status)}</span>
                </p>
                {showDispute && dHref ? (
                  <p className="mt-2 text-xs">
                    <Link href={dHref} className="font-medium text-mint underline-offset-4 hover:underline">
                      View case
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#e0ddd8]/60 bg-[var(--color-background-page)]/50 px-4 py-3">
              <span className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                {formatWhen(row.created_at)}
              </span>
              <Button size="sm" className="bg-mint text-white hover:bg-mint/90" render={<Link href={detailHref(row.id)} />}>
                View order
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
