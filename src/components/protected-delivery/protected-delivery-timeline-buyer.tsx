import { ProofImageGrid } from "@/components/protected-delivery/proof-image-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";
import type { OrderStatus, PaymentStatus, ProtectedDeliveryAssetType } from "@/types/domain";

function proofItems(bundle: ProtectedDeliveryBundle, type: ProtectedDeliveryAssetType) {
  return bundle.assets
    .filter((a) => a.type === type && a.signedUrl)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `${type} ${i + 1}` }));
}

function Step({ done, label, muted }: { done: boolean; label: string; muted?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className={done ? "text-emerald-600" : muted ? "text-muted-foreground" : "text-foreground"}>{done ? "✓" : "○"}</span>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
    </div>
  );
}

export function ProtectedDeliveryTimelineBuyer({
  bundle,
  orderStatus,
  paymentStatus,
}: {
  bundle: ProtectedDeliveryBundle;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const { check, shipment } = bundle;
  const paymentHeld = paymentStatus === "held";
  const shippedOrLater = orderStatus === "shipped" || orderStatus === "delivered" || orderStatus === "completed";
  const deliveredOrLater = orderStatus === "delivered" || orderStatus === "completed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Protected Delivery timeline</CardTitle>
        <CardDescription>Read-only view of seller proof and tracking. Confirm delivery will be added later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Step done={paymentHeld} label="Payment held" />
          <Step done={check.status !== "not_started" || shippedOrLater} label="Seller preparing shipment" />
          <Step done={check.condition_photos_uploaded} label="Condition proof uploaded" />
          <Step done={check.packaging_photos_uploaded} label="Packaging proof uploaded" />
          <Step done={check.tracking_added} label="Tracking added" />
          <Step done={shippedOrLater} label="Shipped" />
          <Step done={deliveredOrLater} label="Delivered (coming next)" muted={!deliveredOrLater} />
        </div>

        {shipment?.courier_name || shipment?.tracking_number ? (
          <div className="rounded-lg border border-border/80 bg-muted/10 p-3 text-sm">
            <p className="font-medium">Tracking</p>
            {shipment.courier_name ? (
              <p className="text-muted-foreground">
                Courier: <span className="text-foreground">{shipment.courier_name}</span>
              </p>
            ) : null}
            {shipment.tracking_number ? (
              <p className="text-muted-foreground">
                Number: <span className="font-mono text-foreground">{shipment.tracking_number}</span>
              </p>
            ) : null}
            {shipment.tracking_url ? (
              <a href={shipment.tracking_url} className="text-xs text-foreground underline underline-offset-2" target="_blank" rel="noreferrer">
                Open tracking link
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Condition</p>
            <ProofImageGrid items={proofItems(bundle, "condition_photo")} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Serial / ID</p>
            <ProofImageGrid items={proofItems(bundle, "serial_number_photo")} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Packaging</p>
            <ProofImageGrid items={proofItems(bundle, "packaging_photo")} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Sealed package</p>
            <ProofImageGrid items={proofItems(bundle, "sealed_package_photo")} />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Receipt (optional)</p>
            <ProofImageGrid items={proofItems(bundle, "receipt_photo")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
