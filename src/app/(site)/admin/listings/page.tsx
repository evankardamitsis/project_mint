import { PageHeader } from "@/components/page-header";
import { PlaceholderTable } from "@/components/dashboard/placeholder-table";

export default function AdminListingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Listings moderation"
        description="Review pending listings, enforce policy, and archive problematic inventory."
      />
      <PlaceholderTable
        columns={["Listing", "Seller", "Status", "Submitted", "Actions"]}
        emptyLabel="No listings in review — pending_review items will appear for moderation."
      />
    </div>
  );
}
