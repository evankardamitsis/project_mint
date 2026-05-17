import { ShieldCheck } from "lucide-react";

/** Listing detail: protected delivery explainer (right column, between seller and description). */
export function ListingProtectedDeliveryTrustDetail() {
  return (
    <div className="my-5 flex items-start gap-4 rounded-2xl bg-[#E8F7F1] p-5">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D9E75]">
        <ShieldCheck className="h-5 w-5 text-white" aria-hidden strokeWidth={2} />
      </div>
      <div>
        <p className="mb-1 text-sm font-bold text-[#0A5C43]">Προστατευμένη παράδοση</p>
        <p className="text-xs leading-relaxed text-[#2D7A60]">
          Η πληρωμή κρατείται μέχρι να επιβεβαιώσεις την παράδοση. Ο πωλητής ανεβάζει φωτογραφίες κατάστασης και
          tracking πριν την αποστολή.
        </p>
      </div>
    </div>
  );
}
