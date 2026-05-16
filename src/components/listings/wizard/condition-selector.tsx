"use client";

import type { ListingCondition } from "@/types/domain";

import { conditionDisplayLabel, LISTING_CONDITION_OPTIONS } from "@/lib/listings/condition-display";

import { cn } from "@/lib/utils";

const HINTS: Partial<Record<ListingCondition, string>> = {
  brand_new: "Factory sealed or never used — include unopened proof if relevant.",
  mint: "Opened briefly; no play wear; complete as new.",
  excellent: "Light use; no major flaws; fully functional.",
  very_good: "Normal play wear; small marks possible; works great.",
  good: "Visible wear or minor issues — disclose clearly in photos and text.",
  fair: "Heavy wear or needs attention — be explicit about what works.",
  poor: "Serious cosmetic or functional issues — describe accurately.",
  non_functioning: "Sold as-is for parts or repair — state what is wrong.",
};

export function ConditionSelector({
  value,
  onChange,
  className,
}: {
  value: ListingCondition;
  onChange: (c: ListingCondition) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-2 sm:grid-cols-2">
        {LISTING_CONDITION_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left text-[13px] font-medium transition",
              value === c
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#e0ddd8] bg-white text-[#333333] hover:border-[#111111]/40",
            )}
          >
            {conditionDisplayLabel(c)}
          </button>
        ))}
      </div>
      {HINTS[value] ? <p className="text-[12px] leading-relaxed text-[#666666]">{HINTS[value]}</p> : null}
    </div>
  );
}
