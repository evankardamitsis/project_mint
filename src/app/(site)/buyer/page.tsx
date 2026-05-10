import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ShoppingBag } from "lucide-react";

export default function BuyerHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Buyer overview"
        description="Track purchases, offers, and any protected-delivery disputes from one place."
      />
      <EmptyState
        icon={ShoppingBag}
        title="Your purchase timeline will appear here"
        description="Once checkout exists, recent orders and delivery milestones will populate this view."
      />
    </div>
  );
}
