import Link from "next/link";
import { Package } from "lucide-react";

import { OrderDashboardCards, OrderDashboardTable } from "@/components/orders/order-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { fetchSellerOrders } from "@/lib/orders/queries";

export default async function SellerOrdersPage() {
  const seller = await fetchSellerProfileForUser();
  if (!seller) {
    return (
      <div className="space-y-8">
        <PageHeader title="Orders" description="Set up your seller profile to receive orders." />
        <EmptyState icon={Package} title="Seller profile required" description="Complete your profile to sell and fulfill orders.">
          <Button render={<Link href="/seller/profile" />}>Set up profile</Button>
        </EmptyState>
      </div>
    );
  }

  const rows = await fetchSellerOrders(seller.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="When a buyer completes checkout on one of your listings, the order will appear here."
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="When a buyer completes checkout on one of your listings, the order will appear here."
        />
      ) : (
        <>
          <OrderDashboardTable
            rows={rows}
            detailHref={(id) => `/seller/orders/${id}`}
            disputeHref={(id) => `/seller/orders/${id}/dispute`}
          />
          <OrderDashboardCards
            rows={rows}
            detailHref={(id) => `/seller/orders/${id}`}
            disputeHref={(id) => `/seller/orders/${id}/dispute`}
          />
        </>
      )}
    </div>
  );
}
