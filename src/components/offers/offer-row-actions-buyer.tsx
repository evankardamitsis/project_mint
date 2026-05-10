"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
}: {
  offerId: string;
  listingSlug: string | null;
  status: OfferStatus;
  expiresAt: string | null;
  parentOfferId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const actionable = isOfferActionable(status, expiresAt);
  const canCancel = actionable && (status === "pending" || status === "countered");
  const canAcceptCounter = actionable && status === "pending" && Boolean(parentOfferId);

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
