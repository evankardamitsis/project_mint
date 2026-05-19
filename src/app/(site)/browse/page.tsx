import { Suspense } from "react";

import { BrowsePageClient } from "@/components/browse/browse-page-client";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getSessionUser } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { browseParamsKey, type BrowseQueryParams } from "@/lib/listings/browse-params";
import { fetchBrands, fetchBrowseListings, fetchCategories } from "@/lib/listings/queries";
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

function BrowseFallback() {
  return (
    <div className="mb-6 h-10 w-full max-w-2xl animate-pulse rounded-full bg-[#EEECE8]" />
  );
}

export default async function BrowsePage(props: PageProps) {
  const locale = await getLocale();
  const b = MESSAGES[locale].browse;

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
    promptText: b.saveSearchPromptText,
    promptAction: b.saveSearchPromptAction,
  };

  return (
    <div className={cn(SITE_CONTAINER, "bg-(--color-background-page) pb-10 pt-6")}>
      <Suspense fallback={<BrowseFallback />}>
        <BrowsePageClient
          key={browseParamsKey(params)}
          params={params}
          listings={listings}
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
          saveCopy={saveCopy}
          searchPlaceholder={b.searchPlaceholder}
          pageHeading={b.pageHeading}
          countOne={b.countOne}
          pageSubtitleMany={b.pageSubtitleMany}
          emptyFilteredTitle={b.emptyFilteredTitle}
          emptyFilteredBody={b.emptyFilteredBody}
          emptyNoneTitle={b.emptyNoneTitle}
          emptyNoneBody={b.emptyNoneBody}
          clearFilters={b.clearFilters}
          viewerId={viewerId}
          loginNextHref={loginNextHref}
          defaultSearchName={defaultSearchName}
          matchedSaved={matchedSaved ? { id: matchedSaved.id, name: matchedSaved.name } : null}
        />
      </Suspense>
    </div>
  );
}
