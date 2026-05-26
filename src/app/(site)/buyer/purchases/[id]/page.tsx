import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyerDisputeSection } from "@/components/disputes/buyer-dispute-section";
import { ConfirmDeliveryPanel } from "@/components/orders/confirm-delivery-panel";
import { DemoPaymentPanel } from "@/components/orders/demo-payment-panel";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryTimelineBuyer } from "@/components/protected-delivery/protected-delivery-timeline-buyer";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
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

  const locale = await getLocale();
  const s = MESSAGES[locale].buyerPurchases;
  const confirmLabels = MESSAGES[locale].confirmDelivery;
  const demoLabels = MESSAGES[locale].demoPayment;

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(order.id);

  const showDemoPay = order.status === "pending_payment" && order.payment_status === "unpaid";
  const showPdTimeline = Boolean(pdBundle && order.payment_status === "held");
  const showConfirmDelivery = order.status === "shipped";

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-[var(--color-text-secondary)]"
          render={<Link href="/buyer/purchases" />}
        >
          {s.backBtn}
        </Button>
      </div>

      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {s.orderKicker}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-[-0.04em] text-[#111111]">
          {s.orderTitle}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{s.orderSubtitle}</p>
      </header>

      <section className="space-y-4">
        <h2 className="sr-only">{s.orderSummarySrTitle}</h2>
        <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} partyEmphasis="seller" />
      </section>

      {showDemoPay ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">{s.nextStep}</h2>
          <DemoPaymentPanel orderId={order.id} labels={demoLabels} />
        </section>
      ) : null}

      {showPdTimeline && pdBundle ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">{s.delivery}</h2>
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

      {showConfirmDelivery ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">{s.confirmSection}</h2>
          <ConfirmDeliveryPanel orderId={order.id} labels={confirmLabels} />
        </section>
      ) : null}

      <section>
        <h2 className="sr-only">{MESSAGES[locale].disputes.supportKicker}</h2>
        <BuyerDisputeSection order={order} />
      </section>
    </div>
  );
}
