import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { ProofImageGrid } from "@/components/protected-delivery/proof-image-grid";
import { Price } from "@/components/price";
import { cn } from "@/lib/utils";
import type { ProtectedDeliveryBundle } from "@/types/protected-delivery";
import type { OrderStatus, PaymentStatus, ProtectedDeliveryAssetType } from "@/types/domain";

function proofItems(bundle: ProtectedDeliveryBundle, type: ProtectedDeliveryAssetType) {
  return bundle.assets
    .filter((a) => a.type === type && a.signedUrl)
    .map((a, i) => ({ src: a.signedUrl as string, alt: `${type} ${i + 1}` }));
}

function Step({
  done,
  current,
  label,
}: {
  done: boolean;
  current?: boolean;
  label: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-transform",
          done && "border-mint bg-mint text-primary-foreground",
          current && !done && "border-ink bg-ink text-surface",
          !done && !current && "border-dashed border-border bg-transparent text-text-caption",
        )}
        aria-hidden
      >
        {done ? <Check className="size-4 stroke-[2.5]" /> : null}
      </div>
      <span
        className={cn(
          "text-sm leading-snug",
          (done || current) && "font-medium text-ink",
          !done && !current && "text-text-muted",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function ProtectedDeliveryTimelineBuyer({
  bundle,
  orderStatus,
  paymentStatus,
  listingImageUrl,
  listingTitle,
  amountCents,
  currency,
  orderId,
  helpHref,
}: {
  bundle: ProtectedDeliveryBundle;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Optional header — buyer order page passes these */
  listingImageUrl?: string | null;
  listingTitle?: string;
  amountCents?: number;
  currency?: string;
  orderId?: string;
  helpHref?: string;
}) {
  const { check, shipment } = bundle;
  const paymentHeld = paymentStatus === "held";
  const shippedOrLater = orderStatus === "shipped" || orderStatus === "delivered" || orderStatus === "completed";
  const deliveredOrLater = orderStatus === "delivered" || orderStatus === "completed";
  const complete = orderStatus === "completed";

  const photosDone =
    check.condition_photos_uploaded &&
    check.packaging_photos_uploaded &&
    check.sealed_package_photo_uploaded;

  const showHeader = listingTitle != null && amountCents != null && currency != null;

  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-surface p-4 shadow-sm sm:p-6">
      {showHeader ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-border/60 pb-5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-warm-bg">
            {listingImageUrl ? (
              <Image src={listingImageUrl} alt="" fill className="object-cover" sizes="64px" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-text-caption">Order</p>
            <p className="truncate font-semibold text-ink">{listingTitle}</p>
            {orderId ? (
              <p className="text-xs text-text-muted">Ref · {orderId.slice(0, 8)}…</p>
            ) : null}
          </div>
          <div className="text-right">
            <Price amountCents={amountCents} currency={currency} className="text-xl font-extrabold tracking-tight text-ink" />
          </div>
          <div className="w-full rounded-xl bg-mint-tint px-3 py-2 text-center text-xs font-semibold text-ink sm:w-auto sm:text-left">
            Payment held safely
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-ink">Delivery progress</h3>
        <p className="mt-1 text-xs text-text-muted">We keep payment until tracking and proof look good.</p>
        <div className="mt-5 space-y-4 border-l border-border/70 pl-1">
          <Step done={paymentHeld} label="Payment held" />
          <Step done={photosDone} current={paymentHeld && !photosDone} label="Seller added photos" />
          <Step done={shippedOrLater} current={photosDone && !shippedOrLater} label="In transit" />
          <Step done={deliveredOrLater} current={shippedOrLater && !deliveredOrLater} label="Delivered" />
          <Step done={complete} current={deliveredOrLater && !complete} label="Complete" />
        </div>
      </div>

      {shipment?.tracking_url ? (
        <p className="text-sm">
          <a href={shipment.tracking_url} className="font-semibold text-mint hover:underline" target="_blank" rel="noreferrer">
            Track shipment →
          </a>
        </p>
      ) : shipment?.tracking_number ? (
        <p className="text-sm text-text-muted">
          Tracking: <span className="font-mono text-ink">{shipment.tracking_number}</span>
        </p>
      ) : null}

      <div className="space-y-4 rounded-xl bg-warm-bg/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">Photos from seller</p>
        <div>
          <p className="mb-1 text-xs text-text-muted">Condition</p>
          <ProofImageGrid items={proofItems(bundle, "condition_photo")} />
        </div>
        <div>
          <p className="mb-1 text-xs text-text-muted">Packaging</p>
          <ProofImageGrid items={proofItems(bundle, "packaging_photo")} />
        </div>
        <div>
          <p className="mb-1 text-xs text-text-muted">Sealed package</p>
          <ProofImageGrid items={proofItems(bundle, "sealed_package_photo")} />
        </div>
      </div>

      {helpHref ? (
        <p className="text-center text-sm text-text-muted">
          <Link href={helpHref} className="text-mint hover:underline">
            Something wrong with your order? Get help →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
