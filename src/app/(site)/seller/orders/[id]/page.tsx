import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDisputeLinkCard } from "@/components/disputes/order-dispute-link-card";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryPanelSeller } from "@/components/protected-delivery/protected-delivery-panel-seller";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
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

  const locale = await getLocale();
  const s = MESSAGES[locale].sellerOrderDetail;

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(order.id);

  const buyerLabel = order.buyer_full_name?.trim() || s.buyerFallback;

  const showPdPanel =
    pdBundle && (order.status === "cleared_for_shipping" || order.status === "shipped");
  const canEditPd =
    order.status === "cleared_for_shipping" &&
    (pdBundle?.check.status === "not_started" || pdBundle?.check.status === "in_progress");

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-[var(--color-text-secondary)]"
          render={<Link href="/seller/orders" />}
        >
          {s.backBtn}
        </Button>
      </div>

      <header className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          {s.kicker}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-[-0.04em] text-[#111111]">
          {s.title}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {s.buyerPrefix}{" "}
          <span className="font-semibold text-[#111111]">{buyerLabel}</span>{" "}
          {s.buyerSuffix}
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="sr-only">{s.orderSummarySrTitle}</h2>
        <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} partyEmphasis="buyer" />
      </section>

      <section>
        <h2 className="sr-only">{s.disputeSrTitle}</h2>
        <OrderDisputeLinkCard order={order} href={`/seller/orders/${order.id}/dispute`} />
      </section>

      {showPdPanel && pdBundle ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[#111111]">{s.pdSectionTitle}</h2>
          <ProtectedDeliveryPanelSeller
            orderId={order.id}
            orderStatus={order.status}
            bundle={pdBundle}
            canEditChecklist={Boolean(canEditPd)}
          />
        </section>
      ) : null}
    </div>
  );
}
