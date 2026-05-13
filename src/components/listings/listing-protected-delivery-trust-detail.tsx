import { ShieldCheck } from "lucide-react";

/** Listing detail: protected delivery explainer (right column, between seller and description). */
export function ListingProtectedDeliveryTrustDetail() {
  return (
    <div className="my-5 flex items-start gap-3 rounded-2xl bg-[#E8F7F1] p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1D9E75]">
        <ShieldCheck className="h-4 w-4 text-white" aria-hidden strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-sm font-bold text-[#0A5C43]">Protected delivery</p>
        <p className="mt-1 text-xs leading-relaxed text-[#2D7A60]">
          Payment is held until you confirm delivery. Seller uploads condition photos and tracking before funds are
          released.
        </p>
      </div>
    </div>
  );
}
