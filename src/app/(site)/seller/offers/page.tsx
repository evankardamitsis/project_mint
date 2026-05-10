import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function SellerOffersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Offers"
        description="Negotiations and counters on your listings will be managed from this inbox."
      />
      <PlaceholderTable
        columns={["Offer", "Listing", "Buyer", "Amount", "Status"]}
        emptyLabel="No active offers — pending and countered offers will show here."
      />
    </div>
  );
}
