import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function BuyerOffersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Your offers"
        description="Track pending offers, counters, and outcomes across listings."
      />
      <PlaceholderTable
        columns={["Offer", "Listing", "Amount", "Status"]}
        emptyLabel="No offers yet — when you negotiate on a listing, it will show up here."
      />
    </div>
  );
}
