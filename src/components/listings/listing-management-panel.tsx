"use client";

import Link from "next/link";

import { AdminListingRowActions } from "@/components/listings/admin-listing-row-actions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListingStatus } from "@/types/domain";

export function ListingManagementPanel({
  listingId,
  slug,
  status,
  isOwnerSeller,
  isAdmin,
  rejectionReason,
}: {
  listingId: string;
  slug: string;
  status: ListingStatus;
  isOwnerSeller: boolean;
  isAdmin: boolean;
  rejectionReason: string | null;
}) {
  if (!isOwnerSeller && !isAdmin) {
    return null;
  }

  return (
    <Card className="border-amber-warn/30 bg-surface-elevated/80 ring-1 ring-amber-warn/15">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Listing management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge domain="listing" value={status} />
        </div>
        {rejectionReason && (isOwnerSeller || isAdmin) ? (
          <p className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Rejection note: </span>
            {rejectionReason}
          </p>
        ) : null}
        {isOwnerSeller ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" render={<Link href={`/seller/listings/${listingId}/edit`} />}>
              Edit listing
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/seller/listings" />}>
              Manage all listings
            </Button>
          </div>
        ) : null}
        {isAdmin ? (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">Admin</p>
            <AdminListingRowActions listingId={listingId} slug={slug} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
