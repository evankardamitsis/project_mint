import Link from "next/link";
import { Package } from "lucide-react";

import { OrderDashboardCards } from "@/components/orders/order-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchBuyerOrders } from "@/lib/orders/queries";

export default async function BuyerPurchasesPage() {
  const rows = await fetchBuyerOrders();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchases"
        description="Gear you bought on mint. — track delivery, proof photos, and buyer protection."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="Your completed purchases will appear here."
        >
          <Button render={<Link href="/browse" />}>Browse listings</Button>
        </EmptyState>
      ) : (
        <OrderDashboardCards
          stack="always"
          rows={rows}
          detailHref={(id) => `/buyer/purchases/${id}`}
          disputeHref={(id) => `/buyer/purchases/${id}/dispute`}
        />
      )}
    </div>
  );
}
