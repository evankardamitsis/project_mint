import Link from "next/link";
import { notFound } from "next/navigation";

import { DisputeDetailView } from "@/components/disputes/dispute-detail-view";
import { Button } from "@/components/ui/button";
import { fetchDisputeDetailBundleForOrder, fetchShipmentForOrder } from "@/lib/disputes/queries";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { fetchOrderDetailForSeller } from "@/lib/orders/queries";
import { ensureProtectedDeliveryCheckIfPaymentHeld } from "@/lib/protected-delivery/ensure-check";
import { fetchProtectedDeliveryBundle } from "@/lib/protected-delivery/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function SellerDisputeDetailPage(props: PageProps) {
  const { id } = await props.params;
  const seller = await fetchSellerProfileForUser();
  if (!seller) {
    notFound();
  }
  const order = await fetchOrderDetailForSeller(id, seller.id);
  if (!order) {
    notFound();
  }

  const bundle = await fetchDisputeDetailBundleForOrder(id);
  if (!bundle) {
    notFound();
  }

  await ensureProtectedDeliveryCheckIfPaymentHeld(order);
  const pdBundle = await fetchProtectedDeliveryBundle(id);
  const shipment = await fetchShipmentForOrder(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href={`/seller/orders/${id}`} />}>
          Back to order
        </Button>
      </div>
      <DisputeDetailView
        bundle={bundle}
        order={order}
        shipment={shipment}
        pdBundle={pdBundle}
        backHref={`/seller/orders/${id}`}
        orderDetailHref={`/seller/orders/${id}`}
        listingHref={`/listing/${order.listing_slug}`}
        viewer="seller"
        partyEmphasis="buyer"
      />
    </div>
  );
}
