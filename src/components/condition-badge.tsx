import { Badge } from "@/components/ui/badge";
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

export function ConditionBadge({ condition }: { condition: ListingCondition }) {
  return (
    <Badge variant="outline" title="Item condition">
      {labels[condition]}
    </Badge>
  );
}
