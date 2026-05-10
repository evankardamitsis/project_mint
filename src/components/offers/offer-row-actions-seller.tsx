"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { OfferCounterForm } from "@/components/offers/offer-counter-form";
import { acceptOfferSellerAction, rejectOfferSellerAction } from "@/lib/offers/actions";
import { isOfferActionable } from "@/lib/offers/expiry";
import { Button } from "@/components/ui/button";
import type { OfferStatus } from "@/types/domain";

export function OfferRowActionsSeller({
  offerId,
  listingSlug,
  status,
  expiresAt,
  parentOfferId,
}: {
  offerId: string;
  listingSlug: string | null;
  status: OfferStatus;
  expiresAt: string | null;
  parentOfferId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showCounter, setShowCounter] = useState(false);
  const actionable = isOfferActionable(status, expiresAt);
  const canSellerRespond = actionable && status === "pending";
  const canAcceptBuyer = canSellerRespond && !parentOfferId;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-1">
        {listingSlug ? (
          <Button variant="ghost" size="sm" render={<Link href={`/listing/${listingSlug}`} />}>
            View listing
          </Button>
        ) : null}
        {canAcceptBuyer ? (
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await acceptOfferSellerAction(offerId);
                if (r.ok) {
                  router.refresh();
                }
              })
            }
          >
            Accept
          </Button>
        ) : null}
        {canSellerRespond ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await rejectOfferSellerAction(offerId);
                if (r.ok) {
                  router.refresh();
                }
              })
            }
          >
            Reject
          </Button>
        ) : null}
        {canSellerRespond ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowCounter((v) => !v)}>
            {showCounter ? "Hide counter" : "Counter"}
          </Button>
        ) : null}
      </div>
      {showCounter && canSellerRespond ? <OfferCounterForm offerId={offerId} /> : null}
    </div>
  );
}
