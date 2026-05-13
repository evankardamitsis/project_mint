import { BuyerOfferDashboardList } from "@/components/offers/offer-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { fetchBuyerOffers, syncExpiredOffersForUser } from "@/lib/offers/queries";
import { Handshake } from "lucide-react";

export default async function BuyerOffersPage() {
  await syncExpiredOffersForUser();
  const rows = await fetchBuyerOffers();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your offers"
        description="Negotiations on listings — your price, the seller's counter, and what happens next."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No offers yet"
          description="Browse active listings and submit an offer below the asking price when the seller allows it."
        />
      ) : (
        <BuyerOfferDashboardList rows={rows} />
      )}
    </div>
  );
}
