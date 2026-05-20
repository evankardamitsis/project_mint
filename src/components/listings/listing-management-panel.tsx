"use client";

import Link from "next/link";

import { AdminListingRowActions } from "@/components/listings/admin-listing-row-actions";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types/domain";

const detailBtn =
  "inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors";

export function ListingManagementPanel({
  listingId,
  slug,
  status,
  isOwnerSeller,
  isAdmin,
  rejectionReason,
  layout = "default",
}: {
  listingId: string;
  slug: string;
  status: ListingStatus;
  isOwnerSeller: boolean;
  isAdmin: boolean;
  rejectionReason: string | null;
  /** `detail` — listing page; `default` — admin table embed */
  layout?: "default" | "detail";
}) {
  if (!isOwnerSeller && !isAdmin) {
    return null;
  }

  const isDetail = layout === "detail";

  return (
    <section aria-label={isAdmin ? "Admin panel" : "Manage listing"}>
      {isDetail ? (
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ABABAB]">
          {isAdmin ? "Admin panel" : "Manage listing"}
        </p>
      ) : null}

      <div
        className={cn(
          isDetail
            ? "rounded-2xl border border-[#E8E6E1] bg-[#FAFAF8] p-5"
            : "rounded-lg border border-amber-warn/30 bg-surface-elevated/80 p-4 ring-1 ring-amber-warn/15",
        )}
      >
        {!isDetail ? (
          <p className="mb-3 text-sm font-semibold text-[#111111]">Listing management</p>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-b border-[#EEECE8] pb-4">
          <span className="text-xs font-medium text-[#888888]">Status</span>
          <StatusBadge domain="listing" value={status} />
        </div>

        {rejectionReason && (isOwnerSeller || isAdmin) ? (
          <div
            className={cn(
              "mt-4 rounded-xl border border-[#F0DEDE] bg-[#FFF9F9] px-4 py-3 text-sm leading-relaxed text-text-secondary",
              !isDetail && "mt-3",
            )}
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#B45309]">
              Rejection note
            </p>
            <p className="text-[#444444]">{rejectionReason}</p>
          </div>
        ) : null}

        {isOwnerSeller ? (
          <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap", isDetail ? "mt-4" : "mt-3")}>
            <Link
              href={`/seller/listings/${listingId}/edit`}
              className={cn(
                detailBtn,
                "border-[#111111] bg-[#111111] text-white hover:bg-[#222222]",
                !isDetail && "text-center",
              )}
            >
              Edit listing
            </Link>
            <Link
              href="/seller/listings"
              className={cn(
                detailBtn,
                "border-[#EEECE8] bg-white text-[#111111] hover:border-[#111111]",
                !isDetail && "text-center",
              )}
            >
              All listings
            </Link>
          </div>
        ) : null}

        {isAdmin ? (
          <div
            className={cn(
              "border-t border-[#EEECE8]",
              isOwnerSeller || rejectionReason ? "mt-4 pt-4" : isDetail ? "mt-4 pt-0" : "mt-3 pt-3",
            )}
          >
            {isDetail ? (
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#ABABAB]">
                Moderation
              </p>
            ) : (
              <p className="mb-2 text-xs font-medium text-muted-foreground">Admin</p>
            )}
            <AdminListingRowActions
              listingId={listingId}
              slug={slug}
              context={isDetail ? "detail" : "table"}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
