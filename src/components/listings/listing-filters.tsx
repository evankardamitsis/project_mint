import { Search } from "lucide-react";

import { ListingFilterChips, type BrowseFilterChipLabels } from "@/components/listings/listing-filter-chips";
import type { BrandOption, CategoryOption } from "@/types/listings";
export function ListingFilters({
  categories,
  brands,
  values,
  filterLabels,
  searchPlaceholder,
  variant = "default",
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
  values: {
    q: string;
    category: string;
    brand: string;
    condition: string;
    min_price: string;
    max_price: string;
    sort: string;
    deal: string;
    priceDrop: string;
  };
  filterLabels: BrowseFilterChipLabels;
  searchPlaceholder?: string;
  variant?: "default" | "browse";
}) {
  const isBrowse = variant === "browse";

  if (isBrowse) {
    return (
      <ListingFilterChips
        categories={categories}
        brands={brands}
        values={values}
        labels={filterLabels}
        variant="browse"
      />
    );
  }

  return (
    <div className="space-y-4">
      <form action="/browse" method="get">
        <button type="submit" className="sr-only">
          Search
        </button>
        <input type="hidden" name="category" value={values.category} />
        <input type="hidden" name="brand" value={values.brand} />
        <input type="hidden" name="condition" value={values.condition} />
        <input type="hidden" name="min_price" value={values.min_price} />
        <input type="hidden" name="max_price" value={values.max_price} />
        <input type="hidden" name="sort" value={values.sort} />
        <input type="hidden" name="deal" value={values.deal} />
        <input type="hidden" name="priceDrop" value={values.priceDrop} />
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute top-1/2 left-[14px] size-4 -translate-y-1/2 text-[#666666]"
            aria-hidden
          />
          <input
            name="q"
            placeholder={searchPlaceholder ?? "Search listings…"}
            defaultValue={values.q}
            className="h-11 w-full border-[1.5px] border-[#111111] bg-[#ffffff] pr-[14px] pl-11 text-[13px] text-[#111111] outline-none placeholder:text-[#999999]"
          />
        </div>
      </form>

      <ListingFilterChips
        categories={categories}
        brands={brands}
        values={values}
        labels={filterLabels}
        variant="default"
      />
    </div>
  );
}
