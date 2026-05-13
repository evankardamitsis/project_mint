import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyerDisputeSection } from "@/components/disputes/buyer-dispute-section";
import { DemoPaymentPanel } from "@/components/orders/demo-payment-panel";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryTimelineBuyer } from "@/components/protected-delivery/protected-delivery-timeline-buyer";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" className="text-[var(--color-text-secondary)]" render={<Link href="/buyer/purchases" />}>
          ← Purchases
        </Button>
      </div>

      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Your order</p>
        <h1 className="text-2xl font-black uppercase tracking-[-0.04em] text-[#111111]">Track &amp; protect</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">Photos, tracking, and help stay on this page.</p>
      </header>

      <section className="space-y-4">
        <h2 className="sr-only">Order summary</h2>
        <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} partyEmphasis="seller" />
      </section>

      {showDemoPay ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">Next step</h2>
          <DemoPaymentPanel orderId={order.id} />
        </section>
      ) : null}

      {showPdTimeline && pdBundle ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">Delivery</h2>
          <ProtectedDeliveryTimelineBuyer
            bundle={pdBundle}
            orderStatus={order.status}
            paymentStatus={order.payment_status}
            listingImageUrl={order.listing_image_url}
            listingTitle={order.listing_title}
            amountCents={order.amount_cents}
            currency={order.currency}
            orderId={order.id}
            helpHref={`/buyer/purchases/${order.id}#get-help`}
          />
        </section>
      ) : null}

      <section>
        <h2 className="sr-only">Help</h2>
        <BuyerDisputeSection order={order} />
      </section>
    </div>
  );
}
