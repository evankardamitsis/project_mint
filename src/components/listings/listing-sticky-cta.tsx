import { cn } from "@/lib/utils";

import { ListingBuyerCtaStack } from "@/components/listings/listing-buyer-cta-stack";

export function ListingStickyCta({
  mode,
  listingId,
  slug,
  priceCents,
  currency,
  offersEnabled,
  loginNextPath,
}: {
  mode: "buy" | "login" | "none";
  listingId: string;
  slug: string;
  priceCents: number;
  currency: string;
  offersEnabled: boolean;
  loginNextPath: string;
}) {
  if (mode === "none") {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEECE8] bg-white px-5 py-3 shadow-[0_-1px_0_#EEECE8] pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden",
      )}
    >
      <ListingBuyerCtaStack
        mode={mode}
        listingId={listingId}
        slug={slug}
        priceCents={priceCents}
        currency={currency}
        offersEnabled={offersEnabled}
        loginNextPath={loginNextPath}
        direction="row"
        compact
      />
    </div>
  );
}
