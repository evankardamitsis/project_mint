import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { LayoutDashboard } from "lucide-react";

export default function SellerHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Seller overview"
        description="High-level snapshot of your shop will live here once analytics and summaries are implemented."
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard widgets are placeholders"
        description="Connect listings, orders, and protected delivery tasks to this view after CRUD is in place."
      />
    </div>
  );
}
