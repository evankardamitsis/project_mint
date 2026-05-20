import { Shield, ShieldCheck, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export type SellerTier = "new" | "trusted" | "top";

const TIER_CONFIG = {
  new: {
    label: "Νέος πωλητής",
    icon: Shield,
    className: "bg-[#F7F6F3] text-[#6B6B6B] border-[#EEECE8]",
  },
  trusted: {
    label: "Αξιόπιστος",
    icon: ShieldCheck,
    className: "bg-[#E8F7F1] text-[#0A5C43] border-[#C5E8DA]",
  },
  top: {
    label: "Κορυφαίος",
    icon: Star,
    className: "bg-[#FEF9EC] text-[#8B6914] border-[#F5E6B0]",
  },
} as const;

export function TierBadge({ tier, size = "sm" }: { tier: SellerTier; size?: "sm" | "md" }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} aria-hidden />
      {config.label}
    </span>
  );
}
