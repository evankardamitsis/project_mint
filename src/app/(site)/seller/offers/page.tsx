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
        <PageHeader
          title="Προσφορές"
          description="Ρύθμισε το προφίλ πωλητή για να λαμβάνεις προσφορές."
        />
        <EmptyState
          icon={Handshake}
          title="Απαιτείται προφίλ πωλητή"
          description="Ολοκλήρωσε το προφίλ σου ώστε οι αγοραστές να μπορούν να σου στέλνουν προσφορές."
        >
          <Button render={<Link href="/seller/profile" />}>Ρύθμιση προφίλ</Button>
        </EmptyState>
      </div>
    );
  }

  const rows = await fetchSellerOffers(seller.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Προσφορές"
        description="Διαπραγματεύσεις για τις αγγελίες σου — αντιπρότεινε, αποδέξου ή απόρριψε."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="Δεν υπάρχουν προσφορές"
          description="Όταν οι αγοραστές υποβάλουν προσφορές στις ενεργές αγγελίες σου, θα εμφανίζονται εδώ."
        />
      ) : (
        <SellerOfferDashboardList rows={rows} />
      )}
    </div>
  );
}
