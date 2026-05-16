import { createClient } from "@/lib/supabase/server";

import { fetchBrowseListings } from "@/lib/listings/queries";
import {
  comparableFromBrowseParams,
  comparableFromSavedSearch,
  savedSearchComparableEquals,
} from "@/lib/saved-searches/saved-search-from-browse";
import type { BrowseQueryParams } from "@/lib/listings/queries";
import type { SavedSearchListItem } from "@/types/saved-searches";

const savedSearchSelect = `
  id,
  user_id,
  name,
  query,
  category_id,
  brand_id,
  condition,
  min_price_cents,
  max_price_cents,
  deal,
  sort,
  notifications_enabled,
  last_checked_at,
  last_match_count,
  created_at,
  updated_at,
  categories ( slug ),
  brands ( slug )
`;

function mapSavedSearchRow(raw: Record<string, unknown>): SavedSearchListItem {
  const catRaw = raw.categories as { slug?: string } | { slug?: string }[] | null | undefined;
  const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
  const brRaw = raw.brands as { slug?: string } | { slug?: string }[] | null | undefined;
  const br = Array.isArray(brRaw) ? brRaw[0] : brRaw;
  return {
    id: raw.id as string,
    user_id: raw.user_id as string,
    name: raw.name as string,
    query: (raw.query as string | null) ?? null,
    category_id: (raw.category_id as string | null) ?? null,
    brand_id: (raw.brand_id as string | null) ?? null,
    category_slug: cat?.slug ?? null,
    brand_slug: br?.slug ?? null,
    condition: (raw.condition as SavedSearchListItem["condition"]) ?? null,
    min_price_cents: (raw.min_price_cents as number | null) ?? null,
    max_price_cents: (raw.max_price_cents as number | null) ?? null,
    deal: (raw.deal as string | null) ?? null,
    sort: (raw.sort as string | null) ?? null,
    notifications_enabled: Boolean(raw.notifications_enabled),
    last_checked_at: (raw.last_checked_at as string | null) ?? null,
    last_match_count: typeof raw.last_match_count === "number" ? raw.last_match_count : Number(raw.last_match_count) || 0,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  };
}

export async function fetchSavedSearchesForUser(): Promise<SavedSearchListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }
  const { data, error } = await supabase
    .from("saved_searches")
    .select(savedSearchSelect)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[saved-searches] fetchSavedSearchesForUser", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapSavedSearchRow(row as Record<string, unknown>));
}

export async function fetchSavedSearchCountForUser(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }
  const { count, error } = await supabase
    .from("saved_searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (error) {
    console.error("[saved-searches] fetchSavedSearchCountForUser", error.message);
    return 0;
  }
  return count ?? 0;
}

/** If current browse params match a saved search owned by the user, return it. */
export async function findSavedSearchMatchingBrowseParams(
  params: BrowseQueryParams,
): Promise<SavedSearchListItem | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("saved_searches")
    .select(savedSearchSelect)
    .eq("user_id", user.id);
  if (error) {
    console.error("[saved-searches] findSavedSearchMatchingBrowseParams", error.message);
    return null;
  }
  const current = comparableFromBrowseParams(params);
  for (const row of data ?? []) {
    const item = mapSavedSearchRow(row as Record<string, unknown>);
    if (savedSearchComparableEquals(current, comparableFromSavedSearch(item))) {
      return item;
    }
  }
  return null;
}

/** Live count of active listings matching this saved search (best-effort; uses browse query). */
export async function fetchSavedSearchCurrentMatchCount(saved: SavedSearchListItem): Promise<number> {
  const params: BrowseQueryParams = {
    q: saved.query ?? "",
    category: saved.category_slug ?? "",
    brand: saved.brand_slug ?? "",
    condition: saved.condition ?? "",
    min_price:
      saved.min_price_cents != null
        ? saved.min_price_cents % 100 === 0
          ? String(saved.min_price_cents / 100)
          : (saved.min_price_cents / 100).toFixed(2)
        : "",
    max_price:
      saved.max_price_cents != null
        ? saved.max_price_cents % 100 === 0
          ? String(saved.max_price_cents / 100)
          : (saved.max_price_cents / 100).toFixed(2)
        : "",
    sort: saved.sort ?? "newest",
    deal: saved.deal === "price-drops" ? "price-drops" : "",
    priceDrop: "",
  };
  const listings = await fetchBrowseListings(params);
  return listings.length;
}
