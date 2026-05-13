import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** Protected-delivery trust callout (listing detail). */
export function ListingTrustStrip({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const isSidebar = variant === "sidebar";
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-[var(--color-success-bg)]",
        isSidebar ? "mt-5 rounded-none border border-[#e0ddd8] p-4" : "mx-4 my-4 rounded-none border border-[#e0ddd8] p-3.5",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[#1a7a4a]">
        <ShieldCheck className="h-4 w-4 text-white" aria-hidden strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#1a7a4a]">Protected delivery</p>
        <p className="mt-0.5 text-xs text-[#666666]">
          Payment held · seller uploads proof · tracking verified
        </p>
      </div>
    </div>
  );
}
