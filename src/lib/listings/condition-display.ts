import type { ListingCondition } from "@/types/domain";

/** User-facing condition labels (`mint` stays the stored enum value; shown as "Σαν καινούριο"). */
export const CONDITION_DISPLAY_LABEL: Record<ListingCondition, string> = {
  brand_new: "Καινούριο",
  mint: "Σαν καινούριο",
  excellent: "Άριστο",
  very_good: "Πολύ καλό",
  good: "Καλό",
  fair: "Μέτριο",
  poor: "Κακό",
  non_functioning: "Μη λειτουργικό",
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
