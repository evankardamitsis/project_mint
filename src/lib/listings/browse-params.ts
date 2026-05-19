/** Client-safe browse URL params (no server imports). */

export type BrowseQueryParams = {
  q?: string;
  category?: string;
  brand?: string;
  condition?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  /** Meaningful price drops (active listings), sorted by newest drop */
  deal?: string;
  priceDrop?: string;
};

export function browsePriceDropsMode(params: BrowseQueryParams): boolean {
  return params.deal === "price-drops" || params.priceDrop === "true";
}

/** Stable key for remounting browse client when URL filters change. */
export function browseParamsKey(params: BrowseQueryParams): string {
  return [
    params.q ?? "",
    params.category ?? "",
    params.brand ?? "",
    params.condition ?? "",
    params.min_price ?? "",
    params.max_price ?? "",
    params.sort ?? "newest",
    params.deal ?? "",
    params.priceDrop ?? "",
  ].join("\0");
}
