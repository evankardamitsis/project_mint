import Image from "next/image";

import { OfferAmount } from "@/components/offers/offer-amount";
import { OfferRowActionsBuyer } from "@/components/offers/offer-row-actions-buyer";
import { OfferRowActionsSeller } from "@/components/offers/offer-row-actions-seller";
import { OfferStatusPill } from "@/components/offers/offer-status-pill";
import { Price } from "@/components/price";
import type { BuyerOfferRow, SellerOfferRow } from "@/types/offers";

function formatWhen(iso: string | null) {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function buyerLabel(row: SellerOfferRow) {
  return row.buyer_full_name?.trim() || row.buyer_email?.trim() || "Buyer";
}

function OfferStatusRow({ status, expiresAt }: { status: string; expiresAt: string | null }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <OfferStatusPill status={status} />
      <span className="text-xs text-[var(--color-text-muted)]">{formatWhen(expiresAt)}</span>
    </div>
  );
}

export function BuyerOfferCards({ rows }: { rows: BuyerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-4 rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/60">
          <div className="flex gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg">
              {row.listings?.primary_image_url ? (
                <Image src={row.listings.primary_image_url} alt="" fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug text-ink">{row.listings?.title ?? "Listing"}</p>
              <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wide text-text-caption">Your offer</p>
              <div className="mt-1 max-w-[92%] self-end rounded-2xl rounded-tr-sm bg-ink px-3 py-2 text-right text-surface">
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} className="text-sm font-extrabold text-surface" />
              </div>
              <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-wide text-text-caption">List price</p>
              <div className="mt-1 max-w-[92%] rounded-2xl rounded-tl-sm border border-border bg-warm-bg px-3 py-2 text-sm text-ink">
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="font-bold" />
                ) : (
                  "—"
                )}
              </div>
              <OfferStatusRow status={row.status} expiresAt={row.expires_at} />
            </div>
          </div>
          <OfferRowActionsBuyer
            offerId={row.id}
            listingSlug={row.listings?.slug ?? null}
            status={row.status}
            expiresAt={row.expires_at}
            parentOfferId={row.parent_offer_id}
            linkedOrderId={row.order_id}
          />
        </div>
      ))}
    </div>
  );
}

export function SellerOfferCards({ rows }: { rows: SellerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-4 rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/60">
          <div className="flex gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-warm-bg">
              {row.listings?.primary_image_url ? (
                <Image src={row.listings.primary_image_url} alt="" fill className="object-cover" sizes="56px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-semibold leading-snug text-ink">{row.listings?.title ?? "Listing"}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{buyerLabel(row)}</p>
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-text-caption">Their offer</p>
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-border bg-warm-bg px-3 py-2">
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} className="text-sm font-extrabold text-ink" />
              </div>
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-text-caption">Your price</p>
              <div className="max-w-[92%] self-end rounded-2xl rounded-tr-sm bg-ink px-3 py-2 text-right text-surface">
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="font-bold text-surface" />
                ) : (
                  "—"
                )}
              </div>
              <OfferStatusRow status={row.status} expiresAt={row.expires_at} />
            </div>
          </div>
          <OfferRowActionsSeller
            offerId={row.id}
            listingSlug={row.listings?.slug ?? null}
            status={row.status}
            expiresAt={row.expires_at}
            parentOfferId={row.parent_offer_id}
          />
        </div>
      ))}
    </div>
  );
}

/** @deprecated Tables removed — use BuyerOfferCards only */
export function BuyerOfferDashboardList({ rows }: { rows: BuyerOfferRow[] }) {
  return <BuyerOfferCards rows={rows} />;
}

/** @deprecated Tables removed — use SellerOfferCards only */
export function SellerOfferDashboardList({ rows }: { rows: SellerOfferRow[] }) {
  return <SellerOfferCards rows={rows} />;
}
