import Link from "next/link";
import { notFound } from "next/navigation";

import { DisputeDetailView } from "@/components/disputes/dispute-detail-view";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchDisputeDetailBundleForOrder, fetchShipmentForOrder } from "@/lib/disputes/queries";
import { fetchOrderDetailForAdmin } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderDisputePage(props: PageProps) {
  const { id } = await props.params;
  const order = await fetchOrderDetailForAdmin(id);
  if (!order) {
    notFound();
  }

  const bundle = await fetchDisputeDetailBundleForOrder(id);
  if (!bundle) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" render={<Link href={`/admin/orders/${id}`} />}>
            Back to order
          </Button>
        </div>
        <PageHeader title="Dispute" description="This order does not have a dispute record yet." />
        <Button render={<Link href={`/admin/orders/${id}`} />}>View order</Button>
      </div>
    );
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(id);
  const shipment = await fetchShipmentForOrder(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href={`/admin/orders/${id}`} />}>
          Back to order
        </Button>
        <Button variant="ghost" size="sm" render={<Link href="/admin/disputes" />}>
          All disputes
        </Button>
      </div>
      <DisputeDetailView
        bundle={bundle}
        order={order}
        shipment={shipment}
        pdBundle={pdBundle}
        backHref={`/admin/orders/${id}`}
        orderDetailHref={`/admin/orders/${id}`}
        listingHref={`/listing/${order.listing_slug}`}
        viewer="admin"
      />
    </div>
  );
}
