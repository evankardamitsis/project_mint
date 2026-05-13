import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { conditionSelectOptions } from "@/lib/listings/condition-display";
import type { BrandOption, CategoryOption } from "@/types/listings";

const conditions = conditionSelectOptions();

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low" },
  { value: "price_desc", label: "Price: high" },
];

function browseHref(patch: Partial<Record<string, string>>) {
  const p = new URLSearchParams();
  const merged: Record<string, string> = { ...patch } as Record<string, string>;
  for (const [k, v] of Object.entries(merged)) {
    if (v) {
      p.set(k, v);
    }
  }
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

function hrefWith(
  base: {
    q: string;
    category: string;
    brand: string;
    condition: string;
    min_price: string;
    max_price: string;
    sort: string;
  },
  patch: Partial<typeof base>,
) {
  const next = { ...base, ...patch };
  return browseHref({
    ...(next.q ? { q: next.q } : {}),
    ...(next.category ? { category: next.category } : {}),
    ...(next.brand ? { brand: next.brand } : {}),
    ...(next.condition ? { condition: next.condition } : {}),
    ...(next.min_price ? { min_price: next.min_price } : {}),
    ...(next.max_price ? { max_price: next.max_price } : {}),
    ...(next.sort && next.sort !== "newest" ? { sort: next.sort } : {}),
  });
}

function ChipLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-xs font-semibold transition-colors",
        active
          ? "bg-[#111111] text-white"
          : "border border-[#EEECE8] bg-white text-[#6B6B6B] hover:border-ink",
      )}
    >
      {children}
    </Link>
  );
}

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
    <div className="space-y-4">
      <form action="/browse" method="get" className="w-full">
        <button type="submit" className="sr-only">
          Search
        </button>
        <input type="hidden" name="category" value={values.category} />
        <input type="hidden" name="brand" value={values.brand} />
        <input type="hidden" name="condition" value={values.condition} />
        <input type="hidden" name="min_price" value={values.min_price} />
        <input type="hidden" name="max_price" value={values.max_price} />
        <input type="hidden" name="sort" value={values.sort} />
        <div className="relative mx-0 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <Input
            name="q"
            placeholder="Search listings…"
            defaultValue={values.q}
            className="h-auto w-full rounded-full border border-[#EEECE8] bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm"
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max flex-nowrap items-center gap-2 pr-1">
            <ChipLink href={hrefWith(values, { category: "" })} active={!values.category}>
              All gear
            </ChipLink>
            {categories.map((c) => (
              <ChipLink key={c.id} href={hrefWith(values, { category: c.slug })} active={values.category === c.slug}>
                {c.name}
              </ChipLink>
            ))}
          </div>
        </div>
        <details className="group relative shrink-0">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-[#EEECE8] bg-white px-3 py-2 text-xs font-semibold text-ink-2 shadow-sm transition-colors marker:content-none hover:border-ink [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4 text-ink-2" aria-hidden />
            Filters
          </summary>
          <form action="/browse" method="get" className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,24rem)] space-y-4 rounded-2xl border border-[#EEECE8] bg-white p-4 shadow-lg">
            <input type="hidden" name="q" value={values.q} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  defaultValue={values.category}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/40"
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
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/40"
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
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/40"
                >
                  <option value="">Any</option>
                  {conditions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">Sort</Label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={values.sort || "newest"}
                  className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/40"
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_price">Min €</Label>
                <Input id="min_price" name="min_price" placeholder="0" defaultValue={values.min_price} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_price">Max €</Label>
                <Input id="max_price" name="max_price" placeholder="Any" defaultValue={values.max_price} className="rounded-xl" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Apply</Button>
              <Button variant="outline" type="button" render={<Link href="/browse" />}>
                Reset
              </Button>
            </div>
          </form>
        </details>
      </div>
    </div>
  );
}
