import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { EmptyState } from "@/components/empty-state";
import {
  type BrowseQueryParams,
  fetchBrands,
  fetchBrowseListings,
  fetchCategories,
} from "@/lib/listings/queries";
import { SITE_CONTAINER } from "@/config/site-layout";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0] ?? "";
  }
  return param ?? "";
}

export default async function BrowsePage(props: PageProps) {
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

  return (
    <div className={cn(SITE_CONTAINER, "space-y-6 bg-background py-6 sm:space-y-8 sm:py-8")}>
      <h1 className="heading text-ink">Browse gear</h1>

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

      {listings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No listings match"
          description="Try different filters or clear search."
        />
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
