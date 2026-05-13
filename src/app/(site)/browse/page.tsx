import Link from "next/link";
import { IconZoomCancel } from "@tabler/icons-react";

import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { SectionHeader } from "@/components/marketing/section-header";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import {
  type BrowseQueryParams,
  fetchBrands,
  fetchBrowseListings,
  fetchCategories,
} from "@/lib/listings/queries";
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
      (p.sort && p.sort !== "newest"),
  );
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
  };

  const [categories, brands, listings] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchBrowseListings(params),
  ]);

  const active = filtersActive(params);
  const countLabel =
    listings.length === 1 ? b.countOne : b.countMany.replace("{n}", String(listings.length));

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
          }}
        />
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
              />
            ))}
          </BauhausListingGrid>
        </div>
      )}
    </div>
  );
}
