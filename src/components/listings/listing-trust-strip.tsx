import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** Protected-delivery trust callout (listing detail). */
export function ListingTrustStrip({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const isSidebar = variant === "sidebar";
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-[#E8F7F1]",
        isSidebar ? "mt-5 rounded-2xl p-4" : "mx-4 my-4 rounded-xl p-3.5",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1D9E75]">
        <ShieldCheck className="h-4 w-4 text-white" aria-hidden strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#0A5C43]">Protected delivery</p>
        <p className="mt-0.5 text-xs text-[#0A5C43]/70">
          Payment held · seller uploads proof · tracking verified
        </p>
      </div>
    </div>
  );
}
