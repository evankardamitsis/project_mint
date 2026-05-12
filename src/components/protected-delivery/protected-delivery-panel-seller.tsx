import { ProofImageGrid } from "@/components/protected-delivery/proof-image-grid";
import { ProtectedDeliveryAssetUploader } from "@/components/protected-delivery/protected-delivery-asset-uploader";
import { ProtectedDeliveryStatusBadge } from "@/components/protected-delivery/protected-delivery-status-badge";
import { ShipmentTrackingForm } from "@/components/protected-delivery/shipment-tracking-form";
import { SubmitProtectedDeliveryButton } from "@/components/protected-delivery/submit-protected-delivery-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";
import type { ProtectedDeliveryAssetType } from "@/types/domain";

function proofItems(bundle: ProtectedDeliveryBundle, type: ProtectedDeliveryAssetType) {
  return bundle.assets
    .filter((a) => a.type === type && a.signedUrl)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `${type} ${i + 1}` }));
}

export function ProtectedDeliveryPanelSeller({
  orderId,
  orderStatus,
  bundle,
  canEditChecklist,
}: {
  orderId: string;
  orderStatus: string;
  bundle: ProtectedDeliveryBundle;
  canEditChecklist: boolean;
}) {
  const { check, shipment } = bundle;
  const readOnly = !canEditChecklist;

  const readyToSubmit =
    check.condition_photos_uploaded &&
    check.packaging_photos_uploaded &&
    check.sealed_package_photo_uploaded &&
    check.tracking_added;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Protected Delivery</CardTitle>
          <ProtectedDeliveryStatusBadge status={check.status} />
        </div>
        <CardDescription>
          Upload packing and condition proof, then save tracking. Insurance and courier APIs are not wired yet — this is an
          MVP checklist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">A. Item condition proof</h3>
          <p className="text-xs text-muted-foreground">Front, back, or close-ups before packing (at least one photo).</p>
          <ProofImageGrid items={proofItems(bundle, "condition_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="condition_photo"
            label="Upload condition photo"
            disabled={readOnly}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">B. Serial number / identifier</h3>
          <p className="text-xs text-muted-foreground">Optional for items without a serial.</p>
          <ProofImageGrid items={proofItems(bundle, "serial_number_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="serial_number_photo"
            label="Upload serial photo"
            disabled={readOnly}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">C. Packaging proof</h3>
          <p className="text-xs text-muted-foreground">Photos while packing (at least one).</p>
          <ProofImageGrid items={proofItems(bundle, "packaging_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="packaging_photo"
            label="Upload packaging photo"
            disabled={readOnly}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">D. Sealed package proof</h3>
          <p className="text-xs text-muted-foreground">Final sealed parcel (required).</p>
          <ProofImageGrid items={proofItems(bundle, "sealed_package_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="sealed_package_photo"
            label="Upload sealed package photo"
            disabled={readOnly}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">E. Receipt / extras</h3>
          <p className="text-xs text-muted-foreground">Optional drop-off receipt or label photo.</p>
          <ProofImageGrid items={proofItems(bundle, "receipt_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="receipt_photo"
            label="Upload receipt photo (optional)"
            disabled={readOnly}
          />
        </section>

        <ShipmentTrackingForm
          key={`${orderId}-${shipment?.id ?? "none"}-${shipment?.tracking_number ?? ""}-${shipment?.courier_name ?? ""}-${check.updated_at}`}
          orderId={orderId}
          initialCourierName={shipment?.courier_name ?? ""}
          initialTrackingNumber={shipment?.tracking_number ?? ""}
          initialTrackingUrl={shipment?.tracking_url ?? ""}
          disabled={readOnly}
        />

        {orderStatus === "cleared_for_shipping" && (check.status === "not_started" || check.status === "in_progress") ? (
          <div className="space-y-2 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              Submitting locks the checklist, marks the order shipped, and sets shipment to in transit (demo — no live carrier).
            </p>
            <SubmitProtectedDeliveryButton orderId={orderId} disabled={readOnly || !readyToSubmit} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
