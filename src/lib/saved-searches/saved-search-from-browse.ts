import type { BrowseQueryParams } from "@/lib/listings/queries";
import { conditionDisplayLabel } from "@/lib/listings/condition-display";
import type { ListingCondition } from "@/types/domain";
import type { SavedSearchListItem } from "@/types/saved-searches";

function centsToBrowsePriceParam(cents: number): string {
  if (cents % 100 === 0) {
    return String(Math.round(cents / 100));
  }
  return (cents / 100).toFixed(2).replace(/\.?0+$/, "");
}

/** Build `/browse?…` from a saved search row (expects category_slug / brand_slug when ids set). */
export function buildBrowseUrlFromSavedSearch(saved: Pick<
  SavedSearchListItem,
  | "query"
  | "category_slug"
  | "brand_slug"
  | "condition"
  | "min_price_cents"
  | "max_price_cents"
  | "deal"
  | "sort"
>): string {
  const p = new URLSearchParams();
  const q = saved.query?.trim();
  if (q) {
    p.set("q", q);
  }
  const cat = saved.category_slug?.trim();
  if (cat) {
    p.set("category", cat);
  }
  const br = saved.brand_slug?.trim();
  if (br) {
    p.set("brand", br);
  }
  if (saved.condition) {
    p.set("condition", saved.condition);
  }
  if (saved.min_price_cents != null) {
    p.set("min_price", centsToBrowsePriceParam(saved.min_price_cents));
  }
  if (saved.max_price_cents != null) {
    p.set("max_price", centsToBrowsePriceParam(saved.max_price_cents));
  }
  const deal = saved.deal?.trim();
  if (deal === "price-drops") {
    p.set("deal", "price-drops");
  }
  const sort = saved.sort?.trim() || "newest";
  if (sort && sort !== "newest") {
    p.set("sort", sort);
  }
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

export type SavedSearchComparable = {
  q: string;
  categorySlug: string;
  brandSlug: string;
  condition: string;
  minCents: number | null;
  maxCents: number | null;
  dealKey: string;
  sort: string;
};

function browsePriceDropsKey(params: BrowseQueryParams): string {
  return params.deal === "price-drops" || params.priceDrop === "true" ? "price-drops" : "";
}

export function comparableFromBrowseParams(params: BrowseQueryParams): SavedSearchComparable {
  const minEur = params.min_price?.trim();
  const maxEur = params.max_price?.trim();
  let minCents: number | null = null;
  let maxCents: number | null = null;
  if (minEur && /^\d+(\.\d{1,2})?$/.test(minEur)) {
    minCents = Math.round(Number.parseFloat(minEur) * 100);
  }
  if (maxEur && /^\d+(\.\d{1,2})?$/.test(maxEur)) {
    maxCents = Math.round(Number.parseFloat(maxEur) * 100);
  }
  return {
    q: params.q?.trim() ?? "",
    categorySlug: params.category?.trim() ?? "",
    brandSlug: params.brand?.trim() ?? "",
    condition: params.condition?.trim() ?? "",
    minCents,
    maxCents,
    dealKey: browsePriceDropsKey(params),
    sort: (params.sort?.trim() || "newest") || "newest",
  };
}

export function comparableFromSavedSearch(saved: SavedSearchListItem): SavedSearchComparable {
  return {
    q: saved.query?.trim() ?? "",
    categorySlug: saved.category_slug?.trim() ?? "",
    brandSlug: saved.brand_slug?.trim() ?? "",
    condition: saved.condition?.trim() ?? "",
    minCents: saved.min_price_cents,
    maxCents: saved.max_price_cents,
    dealKey: saved.deal?.trim() === "price-drops" ? "price-drops" : "",
    sort: (saved.sort?.trim() || "newest") || "newest",
  };
}

export function savedSearchComparableEquals(a: SavedSearchComparable, b: SavedSearchComparable): boolean {
  return (
    a.q === b.q &&
    a.categorySlug === b.categorySlug &&
    a.brandSlug === b.brandSlug &&
    a.condition === b.condition &&
    a.minCents === b.minCents &&
    a.maxCents === b.maxCents &&
    a.dealKey === b.dealKey &&
    a.sort === b.sort
  );
}

/** Human-readable one-line summary for cards. */
export function buildSavedSearchSummary(saved: SavedSearchListItem): string {
  const parts: string[] = [];
  if (saved.query?.trim()) {
    parts.push(`“${saved.query.trim().slice(0, 40)}${saved.query.trim().length > 40 ? "…" : ""}”`);
  }
  if (saved.category_slug) {
    const label = saved.category_slug.replace(/-/g, " ");
    parts.push(label.charAt(0).toUpperCase() + label.slice(1));
  }
  if (saved.brand_slug) {
    parts.push(saved.brand_slug.replace(/-/g, " "));
  }
  if (saved.condition) {
    parts.push(conditionDisplayLabel(saved.condition));
  }
  if (saved.min_price_cents != null || saved.max_price_cents != null) {
    const lo = saved.min_price_cents != null ? `€${centsToBrowsePriceParam(saved.min_price_cents)}` : "";
    const hi = saved.max_price_cents != null ? `€${centsToBrowsePriceParam(saved.max_price_cents)}` : "";
    if (lo && hi) {
      parts.push(`${lo}–${hi}`);
    } else if (hi) {
      parts.push(`≤${hi}`);
    } else if (lo) {
      parts.push(`≥${lo}`);
    }
  }
  if (saved.deal === "price-drops") {
    parts.push("Price drops");
  }
  if (parts.length === 0) {
    return "Browse filters";
  }
  return parts.join(" · ");
}

function browsePriceDropsModeLocal(params: BrowseQueryParams): boolean {
  return params.deal === "price-drops" || params.priceDrop === "true";
}

/** Suggested default name from browse context (category / brand labels optional). */
export function suggestSavedSearchName(
  params: BrowseQueryParams,
  opts: { categoryName?: string | null; brandName?: string | null },
): string {
  if (browsePriceDropsModeLocal(params)) {
    return "Price drops";
  }
  const brand = opts.brandName?.trim();
  const cat = opts.categoryName?.trim();
  const q = params.q?.trim();
  const cond = params.condition?.trim();
  const minEur = params.min_price?.trim();
  const maxEur = params.max_price?.trim();
  let price = "";
  if (minEur && maxEur) {
    price = `€${minEur}–€${maxEur}`;
  } else if (maxEur) {
    price = `under €${maxEur}`;
  } else if (minEur) {
    price = `from €${minEur}`;
  }
  if (brand && price) {
    return `${brand} ${price}`;
  }
  if (brand) {
    return brand;
  }
  if (cat && cond) {
    return `${cat} · ${conditionDisplayLabel(cond as ListingCondition)}`;
  }
  if (cat) {
    return cat;
  }
  if (q) {
    return q.slice(0, 48) + (q.length > 48 ? "…" : "");
  }
  if (cond) {
    return `${conditionDisplayLabel(cond as ListingCondition)} listings`;
  }
  if (price) {
    return `Gear ${price}`;
  }
  return "Saved search";
}
