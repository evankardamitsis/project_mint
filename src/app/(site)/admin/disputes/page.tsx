import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function AdminDisputesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="Resolve buyer and seller disagreements with evidence and structured outcomes."
      />
      <PlaceholderTable
        columns={["Dispute", "Order", "Reason", "Status", "Updated"]}
        emptyLabel="No open disputes — cases opened during the buyer window will surface here."
      />
    </div>
  );
}
