import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function SellerOrdersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Fulfillment, protected delivery checklists, and tracking will surface here."
      />
      <PlaceholderTable
        columns={["Order", "Listing", "Buyer", "Status", "Total"]}
        emptyLabel="No orders yet — paid orders will appear with shipment and payout context."
      />
    </div>
  );
}
