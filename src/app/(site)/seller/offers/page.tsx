import Link from "next/link";
import { Handshake } from "lucide-react";

import { SellerOfferDashboardList } from "@/components/offers/offer-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { fetchSellerOffers, syncExpiredOffersForUser } from "@/lib/offers/queries";

export default async function SellerOffersPage() {
  await syncExpiredOffersForUser();
  const seller = await fetchSellerProfileForUser();
  if (!seller) {
    return (
      <div className="space-y-8">
        <PageHeader title="Offers" description="Set up your seller profile to receive offers." />
        <EmptyState
          icon={Handshake}
          title="Seller profile required"
          description="Complete your profile so buyers can find you and send offers on your listings."
        >
          <Button render={<Link href="/seller/profile" />}>Set up profile</Button>
        </EmptyState>
      </div>
    );
  }

  const rows = await fetchSellerOffers(seller.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Offers"
        description="Negotiations on your listings — counter, accept, or pass. When you accept, the listing stays reserved until checkout."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No offers in your inbox"
          description="When buyers submit offers on your active listings, they will appear here."
        />
      ) : (
        <SellerOfferDashboardList rows={rows} />
      )}
    </div>
  );
}
