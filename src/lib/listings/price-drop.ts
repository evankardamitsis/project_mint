import type { SupabaseClient } from "@supabase/supabase-js";

import type { ListingCardData, ListingDetailData } from "@/types/listings";

export function attachPublicPriceDropToCard<T extends ListingCardData>(item: T, s: PublicPriceDropSignal | undefined): T {
  if (!s) {
    return {
      ...item,
      latest_price_drop_percent: null,
      latest_price_drop_old_price_cents: null,
      latest_price_drop_created_at: null,
    };
  }
  return {
    ...item,
    latest_price_drop_percent: s.drop_percent,
    latest_price_drop_old_price_cents: s.old_price_cents,
    latest_price_drop_created_at: s.drop_at,
  };
}

export function attachPublicPriceDropToDetail(
  listing: ListingDetailData,
  s: PublicPriceDropSignal | undefined,
): ListingDetailData {
  if (!s) {
    return {
      ...listing,
      latest_price_drop_percent: null,
      latest_price_drop_old_price_cents: null,
      latest_price_drop_created_at: null,
    };
  }
  return {
    ...listing,
    latest_price_drop_percent: s.drop_percent,
    latest_price_drop_old_price_cents: s.old_price_cents,
    latest_price_drop_created_at: s.drop_at,
  };
}

export type PublicPriceDropSignal = {
  listing_id: string;
  /** Signed percent change, e.g. -12 for a 12% drop. */
  drop_percent: number;
  old_price_cents: number;
  drop_at: string;
};

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Latest meaningful (≥5%) price-down per active listing among `ids`. */
export async function fetchPublicPriceDropSignalsForListingIds(
  supabase: SupabaseClient,
  ids: readonly string[],
): Promise<Map<string, PublicPriceDropSignal>> {
  const map = new Map<string, PublicPriceDropSignal>();
  if (ids.length === 0) {
    return map;
  }
  const { data, error } = await supabase.rpc("public_listing_price_drop_signals", {
    p_ids: [...ids],
  });
  if (error) {
    console.error("[listings] public_listing_price_drop_signals", error.message);
    return map;
  }
  for (const row of data ?? []) {
    const r = row as {
      listing_id: string;
      drop_percent: unknown;
      old_price_cents: unknown;
      drop_at: string;
    };
    if (!r.listing_id) {
      continue;
    }
    map.set(r.listing_id, {
      listing_id: r.listing_id,
      drop_percent: num(r.drop_percent),
      old_price_cents: Math.round(num(r.old_price_cents)),
      drop_at: r.drop_at,
    });
  }
  return map;
}

export type BrowsePriceDropOrderRow = {
  listing_id: string;
  last_drop_at: string;
  drop_percent: number;
};

export async function fetchBrowsePriceDropOrder(
  supabase: SupabaseClient,
): Promise<BrowsePriceDropOrderRow[]> {
  const { data, error } = await supabase.rpc("browse_listing_price_drops_ordered");
  if (error) {
    console.error("[listings] browse_listing_price_drops_ordered", error.message);
    return [];
  }
  return (data ?? []).map((row: unknown) => {
    const r = row as {
      listing_id: string;
      last_drop_at: string;
      drop_percent: unknown;
    };
    return {
      listing_id: r.listing_id,
      last_drop_at: r.last_drop_at,
      drop_percent: num(r.drop_percent),
    };
  });
}

export type SellerPriceDropInsight = {
  listing_id: string;
  drop_percent: number;
  last_drop_at: string;
};

export async function fetchSellerPriceDropInsights(
  supabase: SupabaseClient,
): Promise<Map<string, SellerPriceDropInsight>> {
  const map = new Map<string, SellerPriceDropInsight>();
  const { data, error } = await supabase.rpc("seller_listing_price_drop_insights");
  if (error) {
    console.error("[listings] seller_listing_price_drop_insights", error.message);
    return map;
  }
  for (const row of data ?? []) {
    const r = row as {
      listing_id: string;
      drop_percent: unknown;
      last_drop_at: string;
    };
    if (!r.listing_id) {
      continue;
    }
    map.set(r.listing_id, {
      listing_id: r.listing_id,
      drop_percent: num(r.drop_percent),
      last_drop_at: r.last_drop_at,
    });
  }
  return map;
}
