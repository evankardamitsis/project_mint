import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function BuyerPurchasesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchases"
        description="Paid orders, shipment tracking, and dispute windows will be listed here."
      />
      <PlaceholderTable
        columns={["Order", "Listing", "Seller", "Status", "Total"]}
        emptyLabel="You have not bought anything yet — completed purchases will land in this table."
      />
    </div>
  );
}
