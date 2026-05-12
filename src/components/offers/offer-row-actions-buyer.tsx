"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { createOrderFromOfferFormAction } from "@/lib/orders/actions";
import { acceptCounterOfferAction, cancelOfferAction } from "@/lib/offers/actions";
import { isOfferActionable } from "@/lib/offers/expiry";
import { Button } from "@/components/ui/button";
import type { OfferStatus } from "@/types/domain";

export function OfferRowActionsBuyer({
  offerId,
  listingSlug,
  status,
  expiresAt,
  parentOfferId,
  linkedOrderId,
}: {
  offerId: string;
  listingSlug: string | null;
  status: OfferStatus;
  expiresAt: string | null;
  parentOfferId: string | null;
  linkedOrderId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const actionable = isOfferActionable(status, expiresAt);
  const canCancel = actionable && (status === "pending" || status === "countered");
  const canAcceptCounter = actionable && status === "pending" && Boolean(parentOfferId);
  const canCheckout = status === "accepted" && !linkedOrderId;

  return (
    <div className="flex flex-wrap justify-end gap-1">
      {listingSlug ? (
        <Button variant="ghost" size="sm" render={<Link href={`/listing/${listingSlug}`} />}>
          View listing
        </Button>
      ) : null}
      {canAcceptCounter ? (
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await acceptCounterOfferAction(offerId);
              if (r.ok) {
                router.refresh();
              }
            })
          }
        >
          Accept counter
        </Button>
      ) : null}
      {canCheckout ? (
        <form action={createOrderFromOfferFormAction} className="inline">
          <input type="hidden" name="offer_id" value={offerId} />
          <Button type="submit" variant="default" size="sm">
            Proceed to checkout
          </Button>
        </form>
      ) : linkedOrderId ? (
        <Button variant="outline" size="sm" render={<Link href={`/buyer/purchases/${linkedOrderId}`} />}>
          View order
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await cancelOfferAction(offerId);
              if (r.ok) {
                router.refresh();
              }
            })
          }
        >
          Cancel offer
        </Button>
      ) : null}
    </div>
  );
}
