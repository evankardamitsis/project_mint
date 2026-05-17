"use client";

import Link from "next/link";

import { buyNowOrderAction } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { cn, formatEuroPrefix } from "@/lib/utils";

export function ListingBuyerCtaStack({
  mode,
  listingId,
  slug,
  priceCents,
  currency,
  offersEnabled,
  loginNextPath,
  direction = "col",
  compact = false,
  className,
}: {
  mode: "buy" | "login";
  listingId: string;
  slug: string;
  priceCents: number;
  currency: string;
  offersEnabled: boolean;
  loginNextPath: string;
  direction?: "row" | "col";
  compact?: boolean;
  className?: string;
}) {
  const priceBit =
    currency === "EUR"
      ? formatEuroPrefix(priceCents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(priceCents / 100);

  const isRow = direction === "row";

  if (compact) {
    // Mobile sticky bar — compact row with both actions
    return (
      <div className={cn("flex gap-3", isRow ? "w-full flex-row items-stretch" : "flex-col", className)}>
        {mode === "buy" ? (
          <form action={buyNowOrderAction} className="min-w-0 flex-1">
            <input type="hidden" name="listing_id" value={listingId} />
            <input type="hidden" name="listing_slug" value={slug} />
            <Button
              type="submit"
              className="h-auto w-full rounded-xl py-3.5 text-sm font-bold text-white bg-[#111111] hover:bg-ink/90"
            >
              Αγόρασε · {priceBit}
            </Button>
          </form>
        ) : (
          <Button
            className="h-auto min-w-0 flex-1 rounded-xl py-3.5 text-sm font-bold text-white bg-[#111111] hover:bg-ink/90"
            render={<Link href={`/auth/login?next=${encodeURIComponent(loginNextPath)}`} />}
          >
            Σύνδεση για αγορά
          </Button>
        )}
        {offersEnabled ? (
          <Link
            href={`/listing/${slug}#offers`}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#F0EEE9] px-5 py-3.5 text-sm font-bold text-[#111111] transition-colors hover:bg-[#E8E6E1]"
          >
            Προσφορά
          </Link>
        ) : null}
      </div>
    );
  }

  // Desktop right column — Buy Now is THE primary CTA; offer is handled by ListingOfferPanel below
  return (
    <div className={cn("flex flex-col", className)}>
      {mode === "buy" ? (
        <form action={buyNowOrderAction}>
          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="listing_slug" value={slug} />
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#111111] py-5 text-lg font-black text-white transition-colors hover:bg-[#222222]"
          >
            Αγόρασε τώρα ({priceBit})
          </button>
        </form>
      ) : (
        <Link
          href={`/auth/login?next=${encodeURIComponent(loginNextPath)}`}
          className="block w-full rounded-2xl bg-[#111111] py-5 text-center text-lg font-black text-white transition-colors hover:bg-[#222222]"
        >
          Συνδέσου για αγορά
        </Link>
      )}
    </div>
  );
}
