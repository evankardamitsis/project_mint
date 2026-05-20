"use client";

import { CheckCircle } from "lucide-react";

import type { ListingCondition } from "@/types/domain";
import { cn } from "@/lib/utils";

export type WizardCondition = "new" | "excellent" | "good" | "fair" | "parts";

export const WIZARD_CONDITIONS = [
  {
    value: "new" as const,
    label: "Καινούριο",
    emoji: "✨",
    description: "Σφραγισμένο ή αχρησιμοποίητο. Ιδανικό για δώρο.",
  },
  {
    value: "excellent" as const,
    label: "Άριστο",
    emoji: "⭐",
    description: "Ελάχιστα σημάδια χρήσης. Σχεδόν σαν καινούριο.",
  },
  {
    value: "good" as const,
    label: "Πολύ καλό",
    emoji: "👍",
    description: "Κανονικά σημάδια χρήσης. Πλήρως λειτουργικό.",
  },
  {
    value: "fair" as const,
    label: "Καλό",
    emoji: "🔧",
    description: "Εμφανείς φθορές αλλά λειτουργεί κανονικά.",
  },
  {
    value: "parts" as const,
    label: "Για ανταλλακτικά",
    emoji: "🔩",
    description: "Δεν λειτουργεί ή χρειάζεται σοβαρή επισκευή.",
  },
];

const WIZARD_TO_LISTING_CONDITION: Record<WizardCondition, ListingCondition> = {
  new: "brand_new",
  excellent: "excellent",
  good: "very_good",
  fair: "good",
  parts: "non_functioning",
};

export function wizardConditionToListingCondition(value: WizardCondition): ListingCondition {
  return WIZARD_TO_LISTING_CONDITION[value];
}

export function wizardConditionLabel(value: WizardCondition): string {
  return WIZARD_CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function WizardConditionPicker({
  value,
  onChange,
  className,
}: {
  value: WizardCondition;
  onChange: (value: WizardCondition) => void;
  className?: string;
}) {
  return (
    <div className={cn("mt-4 space-y-2", className)}>
      {WIZARD_CONDITIONS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={cn(
            "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
            value === c.value
              ? "border-[#111111] bg-[#111111]"
              : "border-[#EEECE8] bg-white hover:border-[#DDDBD6]",
          )}
        >
          <span className="shrink-0 text-2xl leading-none">{c.emoji}</span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm leading-snug font-bold",
                value === c.value ? "text-white" : "text-[#111111]",
              )}
            >
              {c.label}
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs leading-relaxed",
                value === c.value ? "text-white/75" : "text-[#6B6B6B]",
              )}
            >
              {c.description}
            </p>
          </div>
          {value === c.value ? <CheckCircle className="h-5 w-5 shrink-0 text-white" aria-hidden /> : null}
        </button>
      ))}
    </div>
  );
}
