import { AdminDeletePdAssetButton } from "@/components/protected-delivery/admin-delete-pd-asset-button";
import { ProtectedDeliveryStatusBadge } from "@/components/protected-delivery/protected-delivery-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";
import type { ProtectedDeliveryAssetType } from "@/types/domain";

function proofItems(bundle: ProtectedDeliveryBundle, type: ProtectedDeliveryAssetType) {
  return bundle.assets
    .filter((a) => a.type === type && a.signedUrl)
    .map((a, i) => ({ id: a.id, src: a.signedUrl as string, alt: `${type} ${i + 1}` }));
}

export function ProtectedDeliveryPanelAdmin({ bundle }: { bundle: ProtectedDeliveryBundle }) {
  const { check, shipment } = bundle;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Protected Delivery (admin)</CardTitle>
          <ProtectedDeliveryStatusBadge status={check.status} />
        </div>
        <CardDescription>Full proof access. Removing an asset recalculates checklist flags.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Condition photos flag</dt>
            <dd>{check.condition_photos_uploaded ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Packaging photos flag</dt>
            <dd>{check.packaging_photos_uploaded ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Sealed package flag</dt>
            <dd>{check.sealed_package_photo_uploaded ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tracking flag</dt>
            <dd>{check.tracking_added ? "Yes" : "No"}</dd>
          </div>
        </dl>

        {shipment ? (
          <div className="rounded-lg border border-border/80 bg-muted/10 p-3 text-sm">
            <p className="font-medium">Shipment</p>
            <p className="text-muted-foreground">Status: {shipment.status}</p>
            {shipment.courier_name ? <p>Courier: {shipment.courier_name}</p> : null}
            {shipment.tracking_number ? <p className="font-mono">Tracking: {shipment.tracking_number}</p> : null}
            {shipment.tracking_url ? (
              <a href={shipment.tracking_url} className="text-xs underline underline-offset-2" target="_blank" rel="noreferrer">
                Tracking URL
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No shipment row yet.</p>
        )}

        {(["condition_photo", "serial_number_photo", "packaging_photo", "sealed_package_photo", "receipt_photo"] as const).map((type) => {
          const items = proofItems(bundle, type);
          if (!items.length) {
            return null;
          }
          return (
            <div key={type} className="space-y-2">
              <p className="text-xs font-medium capitalize text-muted-foreground">{type.replace(/_/g, " ")}</p>
              <div className="flex flex-wrap gap-3">
                {items.map((img) => (
                  <div key={img.id} className="space-y-2 rounded-lg border border-border p-2">
                    <a href={img.src} target="_blank" rel="noreferrer" className="relative block size-24 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt} className="size-full object-cover" />
                    </a>
                    <AdminDeletePdAssetButton assetId={img.id} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
