import type { ListingCondition } from "@/types/domain";

/** User-facing condition labels (`mint` stays the stored enum value; shown as "Like new"). */
export const CONDITION_DISPLAY_LABEL: Record<ListingCondition, string> = {
  brand_new: "Brand new",
  mint: "Like new",
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  non_functioning: "Non-functioning",
};

export function conditionDisplayLabel(condition: ListingCondition): string {
  return CONDITION_DISPLAY_LABEL[condition];
}

export const LISTING_CONDITION_OPTIONS: ListingCondition[] = [
  "brand_new",
  "mint",
  "excellent",
  "very_good",
  "good",
  "fair",
  "poor",
  "non_functioning",
];

export function conditionSelectOptions(): { value: ListingCondition; label: string }[] {
  return LISTING_CONDITION_OPTIONS.map((value) => ({
    value,
    label: CONDITION_DISPLAY_LABEL[value],
  }));
}
