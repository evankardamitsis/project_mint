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
    <div className="flex gap-4 py-1">
      <div
        className={cn(
          "mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors",
          done && "border-mint bg-mint text-white",
          current && !done && "border-[#111111] bg-[#111111] text-white",
          !done && !current && "border-dashed border-[#e0ddd8] bg-[var(--color-background-surface)] text-[var(--color-text-muted)]",
        )}
        aria-hidden
      >
        {done ? <Check className="size-5 stroke-[2.5]" /> : null}
      </div>
      <div className="min-w-0 flex-1 pt-1.5">
        <span
          className={cn(
            "text-base leading-snug",
            (done || current) && "font-semibold text-[#111111]",
            !done && !current && "font-normal text-[var(--color-text-muted)]",
          )}
        >
          {label}
        </span>
      </div>
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
    <div className="overflow-hidden rounded-2xl bg-[var(--color-background-surface)] shadow-sm ring-1 ring-[#e0ddd8]/70">
      {showHeader ? (
        <div className="flex flex-wrap items-center gap-4 border-b border-[#e0ddd8]/50 bg-[var(--color-background-page)]/40 p-5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--color-background-surface)] sm:size-20">
            {listingImageUrl ? (
              <Image src={listingImageUrl} alt="" fill className="object-cover" sizes="80px" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Your gear</p>
            <p className="mt-1 truncate text-lg font-semibold text-[#111111]">{listingTitle}</p>
            {orderId ? (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Ref · {orderId.slice(0, 8)}…</p>
            ) : null}
          </div>
          <div className="w-full text-left sm:w-auto sm:text-right">
            <Price amountCents={amountCents} currency={currency} className="text-2xl font-black tracking-tight text-[#111111]" />
          </div>
          <div className="w-full rounded-xl bg-mint-tint px-4 py-2.5 text-sm font-medium text-mint-dark sm:w-auto">
            Your payment is held safely until delivery checks out.
          </div>
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">How your order moves</h3>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          A simple path from hold to complete — no fine print on this screen.
        </p>
        <div className="mt-8 space-y-6 border-l-2 border-[#e0ddd8]/80 pl-6">
          <Step done={paymentHeld} label="Payment held" />
          <Step done={photosDone} current={paymentHeld && !photosDone} label="Seller added photos" />
          <Step done={shippedOrLater} current={photosDone && !shippedOrLater} label="In transit" />
          <Step done={deliveredOrLater} current={shippedOrLater && !deliveredOrLater} label="Delivered" />
          <Step done={complete} current={deliveredOrLater && !complete} label="Complete" />
        </div>
      </div>

      {shipment?.tracking_url ? (
        <div className="border-t border-[#e0ddd8]/50 px-5 py-4 sm:px-6">
          <a href={shipment.tracking_url} className="text-sm font-semibold text-mint hover:underline" target="_blank" rel="noreferrer">
            Track shipment →
          </a>
        </div>
      ) : shipment?.tracking_number ? (
        <div className="border-t border-[#e0ddd8]/50 px-5 py-4 text-sm text-[var(--color-text-secondary)] sm:px-6">
          Tracking: <span className="font-mono text-[#111111]">{shipment.tracking_number}</span>
        </div>
      ) : null}

      <div className="space-y-5 border-t border-[#e0ddd8]/50 bg-[var(--color-background-page)]/50 p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Proof from the seller</p>
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Item photos</p>
          <ProofImageGrid items={proofItems(bundle, "condition_photo")} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Packaging</p>
          <ProofImageGrid items={proofItems(bundle, "packaging_photo")} />
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)]">Sealed package</p>
          <ProofImageGrid items={proofItems(bundle, "sealed_package_photo")} />
        </div>
      </div>

      {helpHref ? (
        <p className="border-t border-[#e0ddd8]/50 px-5 py-4 text-center text-sm text-[var(--color-text-secondary)] sm:px-6">
          <Link href={helpHref} className="text-[var(--color-text-secondary)] underline-offset-4 hover:text-mint hover:underline">
            Need something? Get help — we read every case.
          </Link>
        </p>
      ) : null}
    </div>
  );
}
