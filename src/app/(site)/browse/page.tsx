import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  type BrowseQueryParams,
  fetchBrands,
  fetchBrowseListings,
  fetchCategories,
} from "@/lib/listings/queries";
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <PageHeader
        title="Browse gear"
        description="Active listings from sellers across Greece. Use filters to narrow results — URL updates are shareable."
      />
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
          description="Try clearing filters or searching with different keywords."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
