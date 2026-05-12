import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDisputeLinkCard } from "@/components/disputes/order-dispute-link-card";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryPanelSeller } from "@/components/protected-delivery/protected-delivery-panel-seller";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { fetchOrderDetailForSeller } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function SellerOrderDetailPage(props: PageProps) {
  const { id } = await props.params;
  const seller = await fetchSellerProfileForUser();
  if (!seller) {
    notFound();
  }
  const order = await fetchOrderDetailForSeller(id, seller.id);
  if (!order) {
    notFound();
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(order.id);

  const buyerLabel = order.buyer_full_name?.trim() || order.buyer_email?.trim() || "Buyer";

  const showPdPanel =
    pdBundle && (order.status === "cleared_for_shipping" || order.status === "shipped");
  const canEditPd =
    order.status === "cleared_for_shipping" &&
    (pdBundle?.check.status === "not_started" || pdBundle?.check.status === "in_progress");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/seller/orders" />}>
          Back to orders
        </Button>
      </div>
      <PageHeader title="Order" description={`Buyer: ${buyerLabel}`} />
      <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} partyEmphasis="buyer" />
      <OrderDisputeLinkCard order={order} href={`/seller/orders/${order.id}/dispute`} />
      {showPdPanel && pdBundle ? (
        <ProtectedDeliveryPanelSeller
          orderId={order.id}
          orderStatus={order.status}
          bundle={pdBundle}
          canEditChecklist={Boolean(canEditPd)}
        />
      ) : null}
    </div>
  );
}
