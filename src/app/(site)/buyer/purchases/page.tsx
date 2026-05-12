import Link from "next/link";
import { Package } from "lucide-react";

import { OrderDashboardCards, OrderDashboardTable } from "@/components/orders/order-dashboard-list";
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
        description="Orders you start with Buy now or from an accepted offer. Demo payments only — Stripe later."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No purchases yet"
          description="When you buy a listing or complete checkout from an accepted offer, your orders appear here."
        >
          <Button render={<Link href="/browse" />}>Browse listings</Button>
        </EmptyState>
      ) : (
        <>
          <OrderDashboardTable
            rows={rows}
            detailHref={(id) => `/buyer/purchases/${id}`}
            disputeHref={(id) => `/buyer/purchases/${id}/dispute`}
          />
          <OrderDashboardCards
            rows={rows}
            detailHref={(id) => `/buyer/purchases/${id}`}
            disputeHref={(id) => `/buyer/purchases/${id}/dispute`}
          />
        </>
      )}
    </div>
  );
}
