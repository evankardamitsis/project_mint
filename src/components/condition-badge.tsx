import { cn } from "@/lib/utils";
import type { ListingCondition } from "@/types/domain";

const labels: Record<ListingCondition, string> = {
  brand_new: "Brand new",
  mint: "Mint",
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  non_functioning: "Non-functioning",
};

const dotClass: Record<ListingCondition, string> = {
  brand_new: "bg-mint",
  mint: "bg-mint",
  excellent: "bg-mint",
  very_good: "bg-mint-muted",
  good: "bg-amber-warn",
  fair: "bg-dispute",
  poor: "bg-dispute",
  non_functioning: "bg-muted-foreground",
};

export function ConditionBadge({ condition }: { condition: ListingCondition }) {
  return (
    <span
      title="Item condition"
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2 py-0.5 text-xs font-medium text-foreground"
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", dotClass[condition])} aria-hidden />
      {labels[condition]}
    </span>
  );
}
