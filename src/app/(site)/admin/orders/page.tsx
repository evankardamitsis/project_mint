import { Package } from "lucide-react";

import { OrderDashboardCards, OrderDashboardTable } from "@/components/orders/order-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { fetchAdminOrders } from "@/lib/orders/queries";

export default async function AdminOrdersPage() {
  const rows = await fetchAdminOrders();

  return (
    <div className="space-y-8">
      <PageHeader title="Orders" description="All marketplace orders — adjust status for support and testing." />
      {rows.length === 0 ? (
        <EmptyState icon={Package} title="No orders" description="Orders created via checkout will appear here." />
      ) : (
        <>
          <OrderDashboardTable
            rows={rows}
            detailHref={(id) => `/admin/orders/${id}`}
            disputeHref={(id) => `/admin/orders/${id}/dispute`}
          />
          <OrderDashboardCards
            rows={rows}
            detailHref={(id) => `/admin/orders/${id}`}
            disputeHref={(id) => `/admin/orders/${id}/dispute`}
          />
        </>
      )}
    </div>
  );
}
