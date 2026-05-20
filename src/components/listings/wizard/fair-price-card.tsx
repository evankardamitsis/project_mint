import type { ListingCondition } from "@/types/domain";
import type { ProductPriceEstimateRow } from "@/types/product-catalog";

import { Price } from "@/components/price";
import { cn } from "@/lib/utils";

export function FairPriceCard({
  condition,
  estimates,
  className,
}: {
  condition: ListingCondition;
  estimates: ProductPriceEstimateRow[];
  className?: string;
}) {
  const row = estimates.find((e) => e.condition === condition) ?? null;
  if (!row) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-[#dddddd] bg-[#faf9f6] px-4 py-4 text-[13px] text-[#777777]",
          className,
        )}
      >
        No fair-price range for this condition yet — pick a price you are comfortable with.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1a7a4a]/25 bg-white px-4 py-4 shadow-sm",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a7a4a]">Fair price hint</p>
      <p className="mt-2 text-[20px] font-black tabular-nums text-[#111111]">
        <Price amountCents={row.low_price_cents} />{" "}
        <span className="text-[14px] font-semibold text-[#888888]">–</span>{" "}
        <Price amountCents={row.high_price_cents} />
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
        Based on similar items in this condition (seed data — not a live market quote).
      </p>
    </div>
  );
}
