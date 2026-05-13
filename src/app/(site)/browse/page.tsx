import Link from "next/link";
import { IconMusicOff } from "@tabler/icons-react";

import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { Button } from "@/components/ui/button";
import {
  type BrowseQueryParams,
  fetchBrands,
  fetchBrowseListings,
  fetchCategories,
} from "@/lib/listings/queries";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
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
    <div className={cn(SITE_CONTAINER, "space-y-6 bg-background py-6 sm:space-y-8 sm:py-8")}>
      <h1 className="heading text-ink">{b.title}</h1>

      <ListingFilters
        categories={categories}
        brands={brands}
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

      <p className="text-[13px] text-[var(--color-text-secondary)]">{countLabel}</p>

      {listings.length === 0 && active ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <IconMusicOff className="size-10 text-[var(--color-text-tertiary)]" stroke={1.5} aria-hidden />
          <h2 className="text-lg font-semibold text-ink">{b.emptyFilteredTitle}</h2>
          <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{b.emptyFilteredBody}</p>
          <Button render={<Link href="/browse" />}>{b.clearFilters}</Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <IconMusicOff className="size-10 text-[var(--color-text-tertiary)]" stroke={1.5} aria-hidden />
          <h2 className="text-lg font-semibold text-ink">{b.emptyNoneTitle}</h2>
          <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{b.emptyNoneBody}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
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
              sellerDisplayName={item.seller_display_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
