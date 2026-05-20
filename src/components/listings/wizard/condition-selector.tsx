"use client";

import type { ListingCondition } from "@/types/domain";

import { CONDITION_DESCRIPTION_EL } from "@/lib/listings/condition-hints";
import { conditionDisplayLabel, LISTING_CONDITION_OPTIONS } from "@/lib/listings/condition-display";

import { cn } from "@/lib/utils";

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
      <div className="mt-4 rounded-xl bg-[#F7F6F3] p-4">
        <p className="text-sm leading-relaxed text-[#444444]">{CONDITION_DESCRIPTION_EL[value]}</p>
      </div>
    </div>
  );
}
