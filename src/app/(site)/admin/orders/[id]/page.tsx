import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderDisputeLinkCard } from "@/components/disputes/order-dispute-link-card";
import { AdminOrderStatusForm } from "@/components/orders/admin-order-status-form";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProtectedDeliveryPanelAdmin } from "@/components/protected-delivery/protected-delivery-panel-admin";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { fetchOrderDetailForAdmin } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage(props: PageProps) {
  const { id } = await props.params;
  const order = await fetchOrderDetailForAdmin(id);
  if (!order) {
    notFound();
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(order.id);

  const buyerLabel = order.buyer_full_name?.trim() || order.buyer_email?.trim() || "Buyer";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/admin/orders" />}>
          Back to orders
        </Button>
      </div>
      <PageHeader
        title="Order"
        description={`Buyer: ${buyerLabel} · Seller: ${order.seller_display_name}`}
      />
      <OrderSummary order={order} listingHref={`/listing/${order.listing_slug}`} />
      <OrderDisputeLinkCard order={order} href={`/admin/orders/${order.id}/dispute`} />
      <AdminOrderStatusForm orderId={order.id} initialStatus={order.status} initialPayment={order.payment_status} />
      {pdBundle ? <ProtectedDeliveryPanelAdmin bundle={pdBundle} /> : null}
    </div>
  );
}
