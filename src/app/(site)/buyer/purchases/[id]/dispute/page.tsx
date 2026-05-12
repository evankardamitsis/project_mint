import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { DisputeDetailView } from "@/components/disputes/dispute-detail-view";
import { Button } from "@/components/ui/button";
import { fetchDisputeDetailBundleForOrder, fetchShipmentForOrder } from "@/lib/disputes/queries";
import { fetchOrderDetailForBuyer } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function BuyerDisputeDetailPage(props: PageProps) {
  const { id } = await props.params;
  const order = await fetchOrderDetailForBuyer(id);
  if (!order) {
    notFound();
  }

  const bundle = await fetchDisputeDetailBundleForOrder(id);
  if (!bundle) {
    redirect(`/buyer/purchases/${id}`);
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(id);
  const shipment = await fetchShipmentForOrder(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href={`/buyer/purchases/${id}`} />}>
          Back to order
        </Button>
      </div>
      <DisputeDetailView
        bundle={bundle}
        order={order}
        shipment={shipment}
        pdBundle={pdBundle}
        backHref={`/buyer/purchases/${id}`}
        orderDetailHref={`/buyer/purchases/${id}`}
        listingHref={`/listing/${order.listing_slug}`}
        viewer="buyer"
        partyEmphasis="seller"
      />
    </div>
  );
}
