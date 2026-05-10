"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  archiveSellerListingAction,
  deleteSellerListingAction,
  resubmitSellerListingAction,
} from "@/lib/listings/seller-actions";
import { Button } from "@/components/ui/button";
import type { ListingStatus } from "@/types/domain";

const deletable: ListingStatus[] = ["draft", "pending_review", "rejected", "archived"];

export function SellerListingRowActions({
  listingId,
  slug,
  status,
}: {
  listingId: string;
  slug: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const canEdit = status !== "sold";
  const canDelete = deletable.includes(status);
  const canResubmit = status === "rejected";
  const canArchive = status !== "sold" && status !== "archived";

  async function onArchive() {
    const r = await archiveSellerListingAction(listingId);
    if (r.ok) {
      router.refresh();
    }
  }

  async function onResubmit() {
    const r = await resubmitSellerListingAction(listingId);
    if (r.ok) {
      router.refresh();
    }
  }

  async function onDelete() {
    if (!confirm("Delete this listing permanently? This cannot be undone.")) {
      return;
    }
    const r = await deleteSellerListingAction(listingId);
    if (r.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button variant="ghost" size="sm" render={<Link href={`/listing/${slug}`} />}>
        View
      </Button>
      {canEdit ? (
        <Button variant="ghost" size="sm" render={<Link href={`/seller/listings/${listingId}/edit`} />}>
          Edit
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled title="Sold listings are read-only">
          Edit
        </Button>
      )}
      {canArchive ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => void onArchive()}>
          Archive
        </Button>
      ) : null}
      {canResubmit ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => void onResubmit()}>
          Resubmit
        </Button>
      ) : null}
      {canDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => void onDelete()}
        >
          Delete
        </Button>
      ) : null}
    </div>
  );
}
