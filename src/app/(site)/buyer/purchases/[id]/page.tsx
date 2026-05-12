import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyerDisputeSection } from "@/components/disputes/buyer-dispute-section";
import { DemoPaymentPanel } from "@/components/orders/demo-payment-panel";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryTimelineBuyer } from "@/components/protected-delivery/protected-delivery-timeline-buyer";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { fetchOrderDetailForBuyer } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function BuyerPurchaseDetailPage(props: PageProps) {
  const { id } = await props.params;
  const order = await fetchOrderDetailForBuyer(id);
  if (!order) {
    notFound();
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(order.id);

  const showDemoPay = order.status === "pending_payment" && order.payment_status === "unpaid";
  const showPdTimeline = Boolean(pdBundle && order.payment_status === "held");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/buyer/purchases" />}>
          Back to purchases
        </Button>
      </div>
      <PageHeader title="Order" description={`Seller: ${order.seller_display_name}`} />
      <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} partyEmphasis="seller" />
      <BuyerDisputeSection order={order} />
      {showDemoPay ? <DemoPaymentPanel orderId={order.id} /> : null}
      {showPdTimeline && pdBundle ? (
        <ProtectedDeliveryTimelineBuyer bundle={pdBundle} orderStatus={order.status} paymentStatus={order.payment_status} />
      ) : null}
    </div>
  );
}
