import Image from "next/image";
import Link from "next/link";

import { CheckCircle } from "lucide-react";

import { AdminListingRowActions } from "@/components/listings/admin-listing-row-actions";
import { fetchAdminListings } from "@/lib/listings/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { formatEuroPrefix } from "@/lib/utils";
import type { ListingStatus } from "@/types/domain";

function parseStatus(raw: string | undefined): ListingStatus | "all" {
  const allowed = new Set<string>([
    "draft", "pending_review", "active", "reserved", "sold", "rejected", "archived", "all",
  ]);
  if (raw && allowed.has(raw)) return raw as ListingStatus | "all";
  return "pending_review";
}

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminListingsPage(props: PageProps) {
  const sp = await props.searchParams;
  const filter = parseStatus(sp.status);
  const [listings, locale] = await Promise.all([fetchAdminListings(filter), getLocale()]);
  const s = MESSAGES[locale].adminListings;

  const STATUS_TABS = [
    { label: s.tabPending, value: "pending_review" as const },
    { label: s.tabActive, value: "active" as const },
    { label: s.tabArchived, value: "archived" as const },
    { label: s.tabRejected, value: "rejected" as const },
    { label: s.tabAll, value: "all" as const },
  ];

  const actionLabels = {
    viewBtn: s.viewBtn,
    approveBtn: s.approveBtn,
    archiveBtn: s.archiveBtn,
    rejectBtn: s.rejectBtn,
    cancelBtn: s.cancelBtn,
    rejectReasonLabel: s.rejectReasonLabel,
    rejectReasonPlaceholder: s.rejectReasonPlaceholder,
    rejectConfirmBtn: s.rejectConfirmBtn,
    actionFailed: s.actionFailed,
  };

  const dateLocale = locale === "el" ? "el-GR" : "en-GB";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">{s.subtitle}</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto [-ms-overflow-style:none] pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {STATUS_TABS.map((tab) => {
          const active = filter === tab.value;
          const href =
            tab.value === "pending_review"
              ? "/admin/listings"
              : `/admin/listings?status=${tab.value}`;
          return (
            <Link
              key={tab.value}
              href={href}
              className={
                active
                  ? "rounded-full bg-[#111111] px-4 py-2 text-xs font-bold whitespace-nowrap text-white"
                  : "rounded-full border border-[#EEECE8] bg-white px-4 py-2 text-xs font-bold whitespace-nowrap text-[#6B6B6B] transition-colors hover:border-[#111111]"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <CheckCircle className="size-7 text-[#1D9E75]" />
          </div>
          <p className="text-sm font-semibold text-[#111111]">{s.emptyMsg}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-start gap-4 rounded-2xl border border-[#EEECE8] bg-white p-4"
            >
              {/* Thumbnail */}
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F6F3]">
                {listing.primary_image_url ? (
                  <Image
                    src={listing.primary_image_url}
                    alt={listing.title}
                    width={64}
                    height={64}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#111111]">{listing.title}</p>
                <p className="mt-0.5 text-xs text-[#ABABAB]">
                  {listing.seller_display_name}
                  {listing.category_name ? ` · ${listing.category_name}` : ""}
                  {" · "}
                  {formatEuroPrefix(listing.price_cents)}
                </p>
                <p className="mt-0.5 text-xs text-[#ABABAB]">
                  {new Date(listing.created_at).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/listing/${listing.slug}`}
                  target="_blank"
                  className="rounded-xl border border-[#EEECE8] px-3 py-2 text-xs font-semibold text-[#6B6B6B] transition-colors hover:border-[#111111]"
                >
                  {s.viewBtn}
                </Link>
                <AdminListingRowActions listingId={listing.id} slug={listing.slug} labels={actionLabels} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
