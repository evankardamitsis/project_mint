import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Inspect high-risk orders, payment states, and protected delivery compliance."
      />
      <PlaceholderTable
        columns={["Order", "Listing", "Parties", "Status", "Payment"]}
        emptyLabel="No orders to inspect — operational filters will narrow this list later."
      />
    </div>
  );
}
