import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BrandOption, CategoryOption } from "@/types/listings";
import type { ListingCondition } from "@/types/domain";

const conditions: { value: ListingCondition; label: string }[] = [
  { value: "brand_new", label: "Brand new" },
  { value: "mint", label: "Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "very_good", label: "Very good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "non_functioning", label: "Non-functioning" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function ListingFilters({
  categories,
  brands,
  values,
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
  };
}) {
  return (
    <form
      className="space-y-4 rounded-xl border border-border/80 bg-card p-4"
      action="/browse"
      method="get"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            placeholder="Title or description"
            defaultValue={values.q}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={values.category}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <select
            id="brand"
            name="brand"
            defaultValue={values.brand}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            name="condition"
            defaultValue={values.condition}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">Any condition</option>
            {conditions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_price">Min price (EUR)</Label>
          <Input
            id="min_price"
            name="min_price"
            type="text"
            inputMode="decimal"
            placeholder="0"
            defaultValue={values.min_price}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_price">Max price (EUR)</Label>
          <Input
            id="max_price"
            name="max_price"
            type="text"
            inputMode="decimal"
            placeholder="Any"
            defaultValue={values.max_price}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={values.sort || "newest"}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Apply filters</Button>
        <Button variant="outline" type="button" render={<Link href="/browse" />}>
          Reset
        </Button>
      </div>
    </form>
  );
}
