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
  /** Smaller controls for the fixed mobile bar. */
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
  const pad = compact ? "py-3.5 text-sm" : "py-4 text-base";
  const radius = compact ? "rounded-xl" : "rounded-2xl";

  return (
    <div
      className={cn(
        "flex gap-3",
        isRow ? "w-full flex-row items-stretch" : "flex-col",
        className,
      )}
    >
      {mode === "buy" ? (
        <form action={buyNowOrderAction} className={cn(isRow && "min-w-0 flex-1")}>
          <input type="hidden" name="listing_id" value={listingId} />
          <input type="hidden" name="listing_slug" value={slug} />
          <Button
            type="submit"
            className={cn(
              "h-auto w-full text-center font-bold text-white",
              radius,
              pad,
              "bg-[#111111] hover:bg-ink/90",
            )}
          >
            Buy now · {priceBit}
          </Button>
        </form>
      ) : (
        <Button
          className={cn(
            "h-auto text-center font-bold text-white",
            radius,
            pad,
            "bg-[#111111] hover:bg-ink/90",
            isRow ? "min-w-0 flex-1" : "w-full",
          )}
          render={<Link href={`/auth/login?next=${encodeURIComponent(loginNextPath)}`} />}
        >
          Log in to buy
        </Button>
      )}
      {offersEnabled ? (
        <Link
          href={`/listing/${slug}#offers`}
          className={cn(
            "inline-flex items-center justify-center text-center font-bold text-[#111111] transition-colors hover:bg-[#E8E6E1]",
            radius,
            pad,
            "bg-[#F0EEE9]",
            isRow ? "shrink-0 px-5" : "w-full",
          )}
        >
          Make offer
        </Link>
      ) : null}
    </div>
  );
}
