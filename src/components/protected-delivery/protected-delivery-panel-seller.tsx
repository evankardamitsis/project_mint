import { Check } from "lucide-react";

import { ProofImageGrid } from "@/components/protected-delivery/proof-image-grid";
import { ProtectedDeliveryAssetUploader } from "@/components/protected-delivery/protected-delivery-asset-uploader";
import { ShipmentTrackingForm } from "@/components/protected-delivery/shipment-tracking-form";
import { SubmitProtectedDeliveryButton } from "@/components/protected-delivery/submit-protected-delivery-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";
import type { ProtectedDeliveryAssetType } from "@/types/domain";

function proofItems(bundle: ProtectedDeliveryBundle, type: ProtectedDeliveryAssetType) {
  return bundle.assets
    .filter((a) => a.type === type && a.signedUrl)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `${type} ${i + 1}` }));
}

function ChecklistRow({
  title,
  subtitle,
  done,
  highlight,
  children,
}: {
  title: string;
  subtitle?: string;
  done: boolean;
  /** Current focus step — mint-tinted row */
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-4 sm:px-5",
        done && "bg-[var(--color-background-page)]/80 ring-1 ring-[#e0ddd8]/50",
        highlight && !done && "bg-mint-tint ring-1 ring-mint/30",
        !done && !highlight && "bg-transparent ring-1 ring-[#e0ddd8]/40",
      )}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
            done
              ? "border-mint bg-mint text-white"
              : "border-[#e0ddd8]/80 bg-[var(--color-background-surface)] text-[var(--color-text-muted)]",
          )}
          aria-hidden
        >
          {done ? <Check className="size-3.5 stroke-[2.5]" /> : null}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
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

  const highlightCondition = !check.condition_photos_uploaded;
  const highlightPackaging = check.condition_photos_uploaded && !check.packaging_photos_uploaded;
  const highlightSealed =
    check.condition_photos_uploaded && check.packaging_photos_uploaded && !check.sealed_package_photo_uploaded;
  const highlightTracking =
    check.condition_photos_uploaded &&
    check.packaging_photos_uploaded &&
    check.sealed_package_photo_uploaded &&
    !check.tracking_added;

  return (
    <Card className="overflow-hidden border-0 bg-[var(--color-background-surface)] shadow-sm ring-1 ring-[#e0ddd8]/70">
      <CardHeader className="border-b border-[#e0ddd8]/50 bg-[var(--color-background-page)]/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-[#111111]">Ship this order</CardTitle>
          <span className="text-xs capitalize text-[var(--color-text-muted)]">{String(check.status).replace(/_/g, " ")}</span>
        </div>
        <CardDescription className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Walk through the steps — we keep the buyer updated. Payment stays on hold until you ship with proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChecklistRow
          title="Add item photos"
          subtitle="Front, back, or close-ups before you pack (at least one)."
          done={check.condition_photos_uploaded}
          highlight={highlightCondition}
        >
          <ProofImageGrid items={proofItems(bundle, "condition_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="condition_photo"
            label="Add photos"
            disabled={readOnly}
          />
        </ChecklistRow>

        <ChecklistRow
          title="Serial number (optional)"
          subtitle="Snap it if your item has one."
          done={Boolean(proofItems(bundle, "serial_number_photo").length)}
          highlight={false}
        >
          <ProofImageGrid items={proofItems(bundle, "serial_number_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="serial_number_photo"
            label="Add serial photo"
            disabled={readOnly}
          />
        </ChecklistRow>

        <ChecklistRow
          title="Add packaging proof"
          subtitle="Show how you packed it (at least one photo)."
          done={check.packaging_photos_uploaded}
          highlight={highlightPackaging}
        >
          <ProofImageGrid items={proofItems(bundle, "packaging_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="packaging_photo"
            label="Add packaging proof"
            disabled={readOnly}
          />
        </ChecklistRow>

        <ChecklistRow
          title="Add sealed package photo"
          subtitle="The parcel ready to ship."
          done={check.sealed_package_photo_uploaded}
          highlight={highlightSealed}
        >
          <ProofImageGrid items={proofItems(bundle, "sealed_package_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="sealed_package_photo"
            label="Add sealed package photo"
            disabled={readOnly}
          />
        </ChecklistRow>

        <ChecklistRow
          title="Receipt or label (optional)"
          subtitle="Handy if you dropped it off at a counter."
          done={Boolean(proofItems(bundle, "receipt_photo").length)}
          highlight={false}
        >
          <ProofImageGrid items={proofItems(bundle, "receipt_photo")} />
          <ProtectedDeliveryAssetUploader
            orderId={orderId}
            checkId={check.id}
            assetType="receipt_photo"
            label="Add receipt or label photo"
            disabled={readOnly}
          />
        </ChecklistRow>

        <ChecklistRow
          title="Add tracking"
          subtitle="Courier and link so the buyer can follow the parcel."
          done={check.tracking_added}
          highlight={highlightTracking}
        >
          <ShipmentTrackingForm
            key={`${orderId}-${shipment?.id ?? "none"}-${shipment?.tracking_number ?? ""}-${shipment?.courier_name ?? ""}-${check.updated_at}`}
            orderId={orderId}
            initialCourierName={shipment?.courier_name ?? ""}
            initialTrackingNumber={shipment?.tracking_number ?? ""}
            initialTrackingUrl={shipment?.tracking_url ?? ""}
            disabled={readOnly}
          />
        </ChecklistRow>

        {orderStatus === "cleared_for_shipping" && (check.status === "not_started" || check.status === "in_progress") ? (
          <div className="space-y-2 border-t border-[#e0ddd8]/50 pt-5">
            <p className="text-xs text-[var(--color-text-secondary)]">
              When you are ready, we lock the checklist and mark the order shipped (demo — no live carrier).
            </p>
            <SubmitProtectedDeliveryButton orderId={orderId} disabled={readOnly || !readyToSubmit} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
