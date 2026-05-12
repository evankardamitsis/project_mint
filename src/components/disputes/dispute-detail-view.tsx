import Link from "next/link";

import { AdminDisputeResolutionForm } from "@/components/disputes/admin-dispute-resolution-form";
import { DisputeEvidenceGrid } from "@/components/disputes/dispute-evidence-grid";
import { DisputeSummaryCard } from "@/components/disputes/dispute-summary-card";
import { OrderSummary } from "@/components/orders/order-summary";
import { ProofImageGrid } from "@/components/protected-delivery/proof-image-grid";
import { ProtectedDeliveryTimelineBuyer } from "@/components/protected-delivery/protected-delivery-timeline-buyer";
import { SellerDisputeResponseForm } from "@/components/disputes/seller-dispute-response-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DisputeDetailBundle } from "@/types/disputes";
import type { OrderDetail } from "@/types/orders";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";

function pdProofItems(pd: ProtectedDeliveryBundle) {
  return pd.assets
    .filter((a) => a.signedUrl && ["condition_photo", "packaging_photo", "sealed_package_photo"].includes(a.type))
    .slice(0, 6)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `Proof ${i + 1}` }));
}

export function DisputeDetailView({
  bundle,
  order,
  shipment,
  pdBundle,
  backHref,
  orderDetailHref,
  listingHref,
  viewer,
  partyEmphasis,
}: {
  bundle: DisputeDetailBundle;
  order: OrderDetail;
  shipment: {
    courier_name: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    status: string;
  } | null;
  pdBundle: ProtectedDeliveryBundle | null;
  backHref: string;
  orderDetailHref: string;
  listingHref: string;
  viewer: "buyer" | "seller" | "admin";
  partyEmphasis?: "buyer" | "seller";
}) {
  const { dispute, order: o } = bundle;
  const showSellerForm =
    viewer === "seller" && (dispute.status === "open" || dispute.status === "awaiting_seller");
  const showAdminForm = viewer === "admin";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link
          href={backHref}
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Back
        </Link>
      </div>

      <DisputeSummaryCard
        dispute={dispute}
        listingTitle={o.listing_title}
        listingHref={listingHref}
        orderHref={orderDetailHref}
        openedByLabel={dispute.opened_by === order.buyer_id ? "Buyer" : "Participant"}
      />

      <OrderSummary order={order} listingHref={listingHref} partyEmphasis={partyEmphasis} />

      {shipment?.tracking_number || shipment?.courier_name ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Status: <span className="text-foreground">{shipment.status}</span>
            </p>
            {shipment.courier_name ? <p>Courier: {shipment.courier_name}</p> : null}
            {shipment.tracking_number ? <p className="font-mono">Tracking: {shipment.tracking_number}</p> : null}
            {shipment.tracking_url ? (
              <a href={shipment.tracking_url} className="text-xs underline underline-offset-2" target="_blank" rel="noreferrer">
                Tracking link
              </a>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {pdBundle && viewer !== "admin" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Protected delivery proof (summary)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProofImageGrid items={pdProofItems(pdBundle)} label="Key photos" />
            <Link href={orderDetailHref} className="text-sm text-foreground underline underline-offset-2">
              Open full order & delivery timeline
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {pdBundle && viewer === "admin" ? (
        <ProtectedDeliveryTimelineBuyer
          bundle={pdBundle}
          orderStatus={order.status}
          paymentStatus={order.payment_status}
        />
      ) : null}

      <DisputeEvidenceGrid assets={bundle.assets} title="Buyer evidence" />

      {dispute.seller_response ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seller response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="whitespace-pre-wrap">{dispute.seller_response}</p>
            {dispute.seller_responded_at ? (
              <p className="text-xs text-muted-foreground">
                {new Date(dispute.seller_responded_at).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {dispute.admin_notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{dispute.admin_notes}</p>
          </CardContent>
        </Card>
      ) : null}

      {dispute.resolution_notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolution notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{dispute.resolution_notes}</p>
          </CardContent>
        </Card>
      ) : null}

      {showSellerForm ? <SellerDisputeResponseForm orderId={o.id} disputeId={dispute.id} /> : null}
      {showAdminForm ? <AdminDisputeResolutionForm orderId={o.id} disputeId={dispute.id} /> : null}
    </div>
  );
}
