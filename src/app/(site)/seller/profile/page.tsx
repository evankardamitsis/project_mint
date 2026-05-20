import { Check, Info } from "lucide-react";

import { TierBadge } from "@/components/seller/tier-badge";
import { SellerProfileForm } from "@/components/sellers/seller-profile-form";
import { cn } from "@/lib/utils";
import type { SellerTier } from "@/types/domain";
import { PageHeader } from "@/components/page-header";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import type { SellerPayoutStatus, SellerVerificationStatus } from "@/types/domain";

function verificationBadge(status: SellerVerificationStatus) {
  if (status === "verified") {
    return { label: "✓ Επαληθευμένος", className: "bg-[#E8F7F1] text-[#0A5C43]" };
  }
  if (status === "pending") {
    return { label: "Υπό έλεγχο", className: "bg-[#FEF3E2] text-[#C47A15]" };
  }
  if (status === "rejected") {
    return { label: "Απορρίφθηκε", className: "bg-[#FEEDED] text-[#CC4444]" };
  }
  return { label: "Μη επαληθευμένος", className: "bg-[#F7F6F3] text-[#6B6B6B]" };
}

function payoutBadge(status: SellerPayoutStatus) {
  if (status === "active") {
    return { label: "Ενεργές", className: "bg-[#E8F7F1] text-[#0A5C43]", showSetup: false };
  }
  if (status === "pending") {
    return { label: "Υπό επεξεργασία", className: "bg-[#FEF3E2] text-[#C47A15]", showSetup: false };
  }
  if (status === "disabled") {
    return { label: "Απενεργοποιημένες", className: "bg-[#F7F6F3] text-[#6B6B6B]", showSetup: true };
  }
  return { label: "Δεν έχει ρυθμιστεί", className: "bg-[#FEF3E2] text-[#C47A15]", showSetup: true };
}

export default async function SellerProfilePage() {
  const profile = await fetchSellerProfileForUser();
  const verification = verificationBadge(profile?.verification_status ?? "unverified");
  const payout = payoutBadge(profile?.payout_status ?? "not_started");

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Προφίλ πωλητή"
        description="Η δημόσια ταυτότητά σου ως πωλητής."
      />

      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-[#EEECE8] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">Επαλήθευση</span>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${verification.className}`}>
            {verification.label}
          </span>
        </div>
        <div className="h-6 w-px shrink-0 bg-[#EEECE8]" aria-hidden />
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">Πληρωμές</span>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${payout.className}`}>
            {payout.label}
          </span>
          {payout.showSetup ? (
            <a href="#" className="text-xs font-bold text-[#1D9E75] hover:underline">
              Ρύθμισε →
            </a>
          ) : null}
        </div>
      </div>

      {profile ? (
        <div className="mb-6 rounded-2xl border border-[#EEECE8] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111111]">Επίπεδο πωλητή</h3>
            <TierBadge tier={(profile.seller_tier as SellerTier) ?? "new"} size="md" />
          </div>
          <div className="space-y-3">
            {(
              [
                {
                  tier: "trusted" as const,
                  label: "Αξιόπιστος",
                  requirement: "5+ ολοκληρωμένες πωλήσεις χωρίς διαφορές",
                  achieved: (profile.completed_sales_count ?? 0) >= 5,
                },
                {
                  tier: "top" as const,
                  label: "Κορυφαίος",
                  requirement: "25+ πωλήσεις, βαθμολογία 4.8+",
                  achieved: (profile.completed_sales_count ?? 0) >= 25,
                },
              ] as const
            ).map((level) => (
              <div
                key={level.tier}
                className="flex items-center gap-3 border-t border-[#EEECE8] py-2.5 first:border-t-0 first:pt-0"
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    level.achieved ? "bg-[#1D9E75]" : "bg-[#EEECE8]",
                  )}
                >
                  {level.achieved ? (
                    <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-[#ABABAB]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#111111]">{level.label}</p>
                  <p className="mt-0.5 text-xs text-[#6B6B6B]">{level.requirement}</p>
                </div>
                <TierBadge tier={level.tier} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-3 rounded-2xl bg-[#E8F7F1] p-5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden />
        <p className="text-sm leading-relaxed text-[#0A5C43]">
          Οι αγγελίες εμφανίζονται στην αναζήτηση μόνο αφού εγκριθούν. Οι επαληθευμένοι πωλητές εμφανίζονται
          πιο εύκολα.
        </p>
      </div>

      <SellerProfileForm initial={profile} mode={profile ? "edit" : "create"} variant="hub" />
    </div>
  );
}
