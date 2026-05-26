import Link from "next/link";
import { Package } from "lucide-react";

import { OrderDashboardCards } from "@/components/orders/order-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { fetchBuyerOrders } from "@/lib/orders/queries";

export default async function BuyerPurchasesPage() {
  const [rows, locale] = await Promise.all([fetchBuyerOrders(), getLocale()]);
  const s = MESSAGES[locale].buyerPurchases;

  return (
    <div className="space-y-8">
      <PageHeader title={s.title} description={s.description} />
      {rows.length === 0 ? (
        <EmptyState icon={Package} title={s.emptyTitle} description={s.emptyBody}>
          <Button render={<Link href="/browse" />}>{s.browseCta}</Button>
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
