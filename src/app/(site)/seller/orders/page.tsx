import Link from "next/link";
import { Package } from "lucide-react";

import { OrderDashboardCards } from "@/components/orders/order-dashboard-list";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { fetchSellerOrders } from "@/lib/orders/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function SellerOrdersPage() {
  const locale = await getLocale();
  const o = MESSAGES[locale].sellerOrders;

  const seller = await fetchSellerProfileForUser();
  if (!seller) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Παραγγελίες"
          description="Ρύθμισε το προφίλ πωλητή για να λαμβάνεις παραγγελίες."
        />
        <EmptyState
          icon={Package}
          title="Απαιτείται προφίλ πωλητή"
          description="Ολοκλήρωσε το προφίλ σου για να πουλάς και να εκτελείς παραγγελίες."
        >
          <Button render={<Link href="/seller/profile" />}>Ρύθμιση προφίλ</Button>
        </EmptyState>
      </div>
    );
  }

  const rows = await fetchSellerOrders(seller.id);

  return (
    <div className="space-y-8">
      <PageHeader title={o.pageTitle} description={o.pageDescription} />
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Package className="h-8 w-8 text-[#ABABAB]" aria-hidden />
          </div>
          <h3 className="mb-2 text-base font-semibold text-[#111111]">{o.emptyTitle}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-[#6B6B6B]">{o.emptyDescription}</p>
        </div>
      ) : (
        <OrderDashboardCards
          stack="always"
          rows={rows}
          detailHref={(id) => `/seller/orders/${id}`}
          disputeHref={(id) => `/seller/orders/${id}/dispute`}
        />
      )}
    </div>
  );
}
