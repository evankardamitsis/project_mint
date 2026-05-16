import Link from "next/link";
import { IconZoomCancel } from "@tabler/icons-react";

import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { SectionHeader } from "@/components/marketing/section-header";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { BrowseSaveSearchPanel } from "@/components/saved-searches/browse-save-search-panel";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getSessionUser } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import {
  type BrowseQueryParams,
  browsePriceDropsMode,
  fetchBrands,
  fetchBrowseListings,
  fetchCategories,
} from "@/lib/listings/queries";
import { findSavedSearchMatchingBrowseParams } from "@/lib/saved-searches/queries";
import { suggestSavedSearchName } from "@/lib/saved-searches/saved-search-from-browse";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0] ?? "";
  }
  return param ?? "";
}

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

function browsePathFromSearchParams(sp: Record<string, string | string[] | undefined>): string {
  const p = new URLSearchParams();
  for (const [key, raw] of Object.entries(sp)) {
    const v = Array.isArray(raw) ? raw[0] : raw;
    if (v) {
      p.set(key, v);
    }
  }
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

export default async function BrowsePage(props: PageProps) {
  const locale = await getLocale();
  const b = MESSAGES[locale].browse;
  const h = MESSAGES[locale].home;

  const sp = await props.searchParams;
  const params: BrowseQueryParams = {
    q: first(sp.q),
    category: first(sp.category),
    brand: first(sp.brand),
    condition: first(sp.condition),
    min_price: first(sp.min_price),
    max_price: first(sp.max_price),
    sort: first(sp.sort) || "newest",
    deal: first(sp.deal),
    priceDrop: first(sp.priceDrop),
  };

  const user = await getSessionUser();
  const viewerId = user?.id ?? null;

  const [categories, brands, listings, matchedSaved] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchBrowseListings(params),
    viewerId ? findSavedSearchMatchingBrowseParams(params) : Promise.resolve(null),
  ]);

  const active = filtersActive(params);
  const countLabel =
    listings.length === 1 ? b.countOne : b.countMany.replace("{n}", String(listings.length));

  const categoryName = categories.find((c) => c.slug === params.category)?.name ?? null;
  const brandName = brands.find((br) => br.slug === params.brand)?.name ?? null;
  const defaultSearchName = suggestSavedSearchName(params, { categoryName, brandName });
  const loginNextHref = `/auth/login?next=${encodeURIComponent(browsePathFromSearchParams(sp))}`;

  const saveCopy = {
    saveCta: b.saveSearchCta,
    savedLabel: b.saveSearchSaved,
    viewAlerts: b.saveSearchViewAlerts,
    subtleNoFilters: b.saveSearchSubtleNoFilters,
    nameLabel: b.saveSearchNameLabel,
    notificationsLabel: b.saveSearchNotifications,
    submit: b.saveSearchSubmit,
    cancel: b.saveSearchCancel,
    guestHint: b.saveSearchGuestHint,
  };

  return (
    <div className={cn(SITE_CONTAINER, "bg-[var(--color-background-page)] pb-10 pt-0")}>
      <h1 className="px-5 pb-4 pt-6 text-[clamp(28px,5vw,40px)] font-black uppercase tracking-[-0.03em] text-[#111111] [font-family:var(--font-display),Helvetica_Neue,sans-serif]">
        {b.title}
      </h1>

      <div className="px-5 pb-2">
        <ListingFilters
          categories={categories}
          brands={brands}
          filterLabels={{
            clearAllLink: b.clearAllLink,
            filterCategory: b.filterCategory,
            filterBrand: b.filterBrand,
            filterCondition: b.filterCondition,
            filterPrice: b.filterPrice,
            filterPriceDrops: b.filterPriceDrops,
            filterAllCategories: b.filterAllCategories,
            filterAllBrands: b.filterAllBrands,
            filterAnyCondition: b.filterAnyCondition,
            sortNewest: b.sortNewest,
            sortPriceAsc: b.sortPriceAsc,
            sortPriceDesc: b.sortPriceDesc,
            priceAny: b.priceAny,
            priceUnder250: b.priceUnder250,
            price250to500: b.price250to500,
            price500to1000: b.price500to1000,
            priceOver1000: b.priceOver1000,
          }}
          values={{
            q: params.q ?? "",
            category: params.category ?? "",
            brand: params.brand ?? "",
            condition: params.condition ?? "",
            min_price: params.min_price ?? "",
            max_price: params.max_price ?? "",
            sort: params.sort ?? "newest",
            deal: browsePriceDropsMode(params) ? "price-drops" : "",
            priceDrop: params.priceDrop === "true" ? "true" : "",
          }}
        />
        <div className="mt-4 max-w-md">
          <BrowseSaveSearchPanel
            copy={saveCopy}
            filtersActive={active}
            isGuest={!viewerId}
            loginNextHref={loginNextHref}
            defaultName={defaultSearchName}
            formDefaults={{
              q: params.q ?? "",
              category: params.category ?? "",
              brand: params.brand ?? "",
              condition: params.condition ?? "",
              min_price: params.min_price ?? "",
              max_price: params.max_price ?? "",
              sort: params.sort ?? "newest",
              deal: browsePriceDropsMode(params) ? "price-drops" : "",
              priceDrop: params.priceDrop === "true" ? "true" : "",
            }}
            matchedSaved={matchedSaved ? { id: matchedSaved.id, name: matchedSaved.name } : null}
          />
        </div>
      </div>

      <p className="px-5 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#999999]">{countLabel}</p>

      {listings.length === 0 && active ? (
        <div className="mx-5 flex flex-col items-center justify-center gap-4 border border-[#111111] bg-[#ffffff] px-6 py-16 text-center">
          <IconZoomCancel className="size-8 text-[#cccccc]" stroke={1.25} aria-hidden />
          <h2 className="text-[14px] font-black uppercase text-[#111111]">{b.emptyFilteredTitle}</h2>
          <p className="max-w-md text-[12px] text-[#999999]">{b.emptyFilteredBody}</p>
          <Button
            className="rounded-none border-0 bg-[#111111] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-white hover:bg-[#111111]/90"
            render={<Link href="/browse" />}
          >
            {b.clearFilters}
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="mx-5 flex flex-col items-center justify-center gap-4 border border-[#111111] bg-[#ffffff] px-6 py-16 text-center">
          <IconZoomCancel className="size-8 text-[#cccccc]" stroke={1.25} aria-hidden />
          <h2 className="text-[14px] font-black uppercase text-[#111111]">{b.emptyNoneTitle}</h2>
          <p className="max-w-md text-[12px] text-[#999999]">{b.emptyNoneBody}</p>
        </div>
      ) : (
        <div className="px-5">
          <SectionHeader title={b.listingsSection} seeAllHref="/browse" seeAllLabel={h.seeAll} />
          <BauhausListingGrid className="border-t-0">
            {listings.map((item, index) => (
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
                imagePriority={index < 3}
                protectedDeliveryEnabled={item.protected_delivery_enabled}
                categoryName={item.category_name}
                categorySlug={item.category_slug ?? null}
                sellerDisplayName={item.seller_display_name}
                latestPriceDropPercent={item.latest_price_drop_percent ?? null}
                latestPriceDropOldPriceCents={item.latest_price_drop_old_price_cents ?? null}
                latestPriceDropCreatedAt={item.latest_price_drop_created_at ?? null}
              />
            ))}
          </BauhausListingGrid>
        </div>
      )}
    </div>
  );
}
