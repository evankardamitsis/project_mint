import { ShieldCheck } from "lucide-react";

/** Listing detail: protected delivery explainer (right column, between seller and description). */
export function ListingProtectedDeliveryTrustDetail() {
  return (
    <div className="my-5 flex items-start gap-3 rounded-none border border-[#e0ddd8] bg-[var(--color-success-bg)] p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[#1a7a4a]">
        <ShieldCheck className="h-4 w-4 text-white" aria-hidden strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-sm font-bold text-[#1a7a4a]">Protected delivery</p>
        <p className="mt-1 text-xs leading-relaxed text-[#666666]">
          Payment is held until you confirm delivery. Seller uploads condition photos and tracking before funds are
          released.
        </p>
      </div>
    </div>
  );
}
