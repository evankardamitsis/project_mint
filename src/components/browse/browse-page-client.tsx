"use client";

import Link from "next/link";
import { IconZoomCancel } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { ListingCard } from "@/components/listings/listing-card";
import {
  ListingFilterChips,
  type BrowseFilterChipLabels,
} from "@/components/listings/listing-filter-chips";
import { BrowseSaveSearchPanel } from "@/components/saved-searches/browse-save-search-panel";
import { SmartSearch } from "@/components/smart-search";
import { Button } from "@/components/ui/button";
import {
  type BrowseQueryParams,
  browsePriceDropsMode,
} from "@/lib/listings/browse-params";
import type { BrandOption, CategoryOption, ListingCardData } from "@/types/listings";

function filtersActive(p: BrowseQueryParams): boolean {
  return Boolean(
    p.q?.trim() ||
      p.category?.trim() ||
      p.brand?.trim() ||
      p.condition?.trim() ||
      p.min_price?.trim() ||
      p.max_price?.trim() ||
      (p.sort && p.sort !== "newest") ||
      browsePriceDropsMode(p),
  );
}

function clientFilterListings(
  listings: ListingCardData[],
  liveQ: string,
  serverQ: string,
): ListingCardData[] {
  const live = liveQ.trim().toLowerCase();
  if (!live) return listings;
  const server = serverQ.trim().toLowerCase();
  if (live === server) return listings;
  return listings.filter((item) => {
    const hay = [item.title, item.category_name, item.seller_display_name, item.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(live);
  });
}

type SaveCopy = {
  saveCta: string;
  savedLabel: string;
  viewAlerts: string;
  subtleNoFilters: string;
  nameLabel: string;
  notificationsLabel: string;
  submit: string;
  cancel: string;
  guestHint: string;
  promptText: string;
  promptAction: string;
};

export function BrowsePageClient({
  params,
  listings,
  categories,
  brands,
  filterLabels,
  saveCopy,
  searchPlaceholder,
  pageHeading,
  countOne,
  pageSubtitleMany,
  emptyFilteredTitle,
  emptyFilteredBody,
  emptyNoneTitle,
  emptyNoneBody,
  clearFilters,
  viewerId,
  loginNextHref,
  defaultSearchName,
  matchedSaved,
}: {
  params: BrowseQueryParams;
  listings: ListingCardData[];
  categories: CategoryOption[];
  brands: BrandOption[];
  filterLabels: BrowseFilterChipLabels;
  saveCopy: SaveCopy;
  searchPlaceholder: string;
  pageHeading: string;
  countOne: string;
  pageSubtitleMany: string;
  emptyFilteredTitle: string;
  emptyFilteredBody: string;
  emptyNoneTitle: string;
  emptyNoneBody: string;
  clearFilters: string;
  viewerId: string | null;
  loginNextHref: string;
  defaultSearchName: string;
  matchedSaved: { id: string; name: string } | null;
}) {
  const serverQ = params.q ?? "";
  const [liveQuery, setLiveQuery] = useState(serverQ);

  const chipValues = {
    q: liveQuery,
    category: params.category ?? "",
    brand: params.brand ?? "",
    condition: params.condition ?? "",
    min_price: params.min_price ?? "",
    max_price: params.max_price ?? "",
    sort: params.sort ?? "newest",
    deal: browsePriceDropsMode(params) ? "price-drops" : "",
    priceDrop: params.priceDrop === "true" ? "true" : "",
  };

  const displayListings = useMemo(
    () => clientFilterListings(listings, liveQuery, serverQ),
    [listings, liveQuery, serverQ],
  );

  const active = filtersActive({ ...params, q: liveQuery }) || liveQuery.trim().length > 0;
  const totalCount = displayListings.length;
  const subtitle =
    totalCount === 1 ? countOne : pageSubtitleMany.replace("{n}", String(totalCount));

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{pageHeading}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">{subtitle}</p>
      </div>

      <div className="space-y-4">
        <SmartSearch
          variant="browse"
          initialQuery={serverQ}
          onQueryChange={setLiveQuery}
          placeholder={searchPlaceholder}
        />
        <ListingFilterChips
          categories={categories}
          brands={brands}
          values={chipValues}
          labels={filterLabels}
          variant="browse"
        />
      </div>

      <BrowseSaveSearchPanel
        copy={saveCopy}
        filtersActive={active}
        isGuest={!viewerId}
        loginNextHref={loginNextHref}
        defaultName={defaultSearchName}
        formDefaults={{
          q: liveQuery,
          category: chipValues.category,
          brand: chipValues.brand,
          condition: chipValues.condition,
          min_price: chipValues.min_price,
          max_price: chipValues.max_price,
          sort: chipValues.sort,
          deal: chipValues.deal,
          priceDrop: chipValues.priceDrop,
        }}
        matchedSaved={matchedSaved}
      />

      {displayListings.length === 0 && active ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-[#EEECE8] bg-white px-6 py-16 text-center">
          <IconZoomCancel className="size-8 text-[#cccccc]" stroke={1.25} aria-hidden />
          <h2 className="text-sm font-bold text-[#111111]">{emptyFilteredTitle}</h2>
          <p className="max-w-md text-sm text-[#6B6B6B]">{emptyFilteredBody}</p>
          <Button
            className="rounded-full bg-[#111111] px-5 py-2 text-sm font-semibold text-white hover:bg-[#111111]/90"
            render={<Link href="/browse" />}
          >
            {clearFilters}
          </Button>
        </div>
      ) : displayListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 border border-[#EEECE8] bg-white px-6 py-16 text-center">
          <IconZoomCancel className="size-8 text-[#cccccc]" stroke={1.25} aria-hidden />
          <h2 className="text-sm font-bold text-[#111111]">{emptyNoneTitle}</h2>
          <p className="max-w-md text-sm text-[#6B6B6B]">{emptyNoneBody}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {displayListings.map((item, index) => (
            <ListingCard
              key={item.id}
              listingId={item.id}
              viewerUserId={viewerId}
              sellerOwnerUserId={item.seller_owner_user_id ?? null}
              isSaved={Boolean(item.is_saved_by_current_user)}
              isGuest={!viewerId}
              title={item.title}
              slug={item.slug}
              priceCents={item.price_cents}
              currency={item.currency}
              condition={item.condition}
              location={item.location}
              imageUrl={item.primary_image_url}
              imagePriority={index < 6}
              protectedDeliveryEnabled={item.protected_delivery_enabled}
              categoryName={item.category_name}
              categorySlug={item.category_slug ?? null}
              sellerDisplayName={item.seller_display_name}
              latestPriceDropPercent={item.latest_price_drop_percent ?? null}
              latestPriceDropOldPriceCents={item.latest_price_drop_old_price_cents ?? null}
              latestPriceDropCreatedAt={item.latest_price_drop_created_at ?? null}
            />
          ))}
        </div>
      )}
    </>
  );
}
