import { createClient } from "@/lib/supabase/server";

import { attachPublicPriceDropToCard, fetchPublicPriceDropSignalsForListingIds } from "@/lib/listings/price-drop";
import type { ListingCardData, ListingImageRow } from "@/types/listings";
import type { ListingCondition, ListingStatus } from "@/types/domain";

function primaryImageUrl(images: ListingImageRow[] | null | undefined): string | null {
  if (!images?.length) {
    return null;
  }
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.url ?? null;
}

/** Followed listing ids for the current user within the given id set (empty if guest). */
export async function fetchFollowedListingIdsForUser(
  listingIds: readonly string[],
): Promise<Set<string>> {
  if (listingIds.length === 0) {
    return new Set();
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Set();
  }
  const { data, error } = await supabase
    .from("follows")
    .select("listing_id")
    .eq("user_id", user.id)
    .in("listing_id", [...listingIds]);
  if (error) {
    console.error("[follows] fetchFollowedListingIdsForUser", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.listing_id as string));
}

export async function fetchBuyerFollowsCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }
  const { count, error } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (error) {
    console.error("[follows] fetchBuyerFollowsCount", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchBuyerFollowListings(): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("follows")
    .select(
      `
      created_at,
      listings (
        id,
        title,
        slug,
        price_cents,
        currency,
        condition,
        status,
        location,
        created_at,
        protected_delivery_enabled,
        categories ( name, slug ),
        listing_images ( id, url, sort_order ),
        seller_profiles ( display_name, user_id )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[follows] fetchBuyerFollowListings", error.message);
    return [];
  }

  const rows = (data ?? []) as unknown as {
    created_at: string;
    listings:
      | {
          id: string;
          title: string;
          slug: string;
          price_cents: number;
          currency: string;
          condition: ListingCondition;
          status: ListingStatus;
          location: string | null;
          created_at: string;
          protected_delivery_enabled: boolean | null;
          categories: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
          listing_images: ListingImageRow[] | null;
          seller_profiles:
            | { display_name?: string; user_id?: string }
            | { display_name?: string; user_id?: string }[]
            | null;
        }
      | null
      | Array<{
          id: string;
          title: string;
          slug: string;
          price_cents: number;
          currency: string;
          condition: ListingCondition;
          status: ListingStatus;
          location: string | null;
          created_at: string;
          protected_delivery_enabled: boolean | null;
          categories: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
          listing_images: ListingImageRow[] | null;
          seller_profiles:
            | { display_name?: string; user_id?: string }
            | { display_name?: string; user_id?: string }[]
            | null;
        }>;
  }[];

  const out: ListingCardData[] = [];
  for (const row of rows) {
    const rawL = row.listings;
    const L = Array.isArray(rawL) ? rawL[0] : rawL;
    if (!L) {
      continue;
    }
    const catRaw = L.categories;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    const spRaw = L.seller_profiles;
    const sp = Array.isArray(spRaw) ? spRaw[0] : spRaw;
    out.push({
      id: L.id,
      title: L.title,
      slug: L.slug,
      price_cents: L.price_cents,
      currency: L.currency ?? "EUR",
      condition: L.condition,
      location: L.location ?? null,
      status: L.status,
      created_at: L.created_at,
      primary_image_url: primaryImageUrl(L.listing_images),
      protected_delivery_enabled: Boolean(L.protected_delivery_enabled),
      category_name: cat?.name ?? null,
      category_slug: cat?.slug ?? null,
      seller_display_name: sp?.display_name?.trim() ?? null,
      seller_owner_user_id: sp?.user_id?.trim() ?? null,
      is_followed_by_current_user: true,
      followed_at: row.created_at as string,
    });
  }

  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, out.map((r) => r.id));
  return out.map((r) => attachPublicPriceDropToCard(r, signals.get(r.id)));
}

export async function fetchListingFollowCount(listingId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("listing_follow_count_public", {
    p_listing_id: listingId,
  });
  if (error) {
    console.error("[follows] fetchListingFollowCount", error.message);
    return 0;
  }
  if (data == null) {
    return 0;
  }
  return typeof data === "number" ? data : Number(data);
}

export async function fetchSellerFollowCountsByListingId(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("seller_listing_follow_counts");
  if (error) {
    console.error("[follows] fetchSellerFollowCountsByListingId", error.message);
    return new Map();
  }
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const r = row as { listing_id: string; follow_count: number | string };
    if (r.listing_id) {
      map.set(r.listing_id, typeof r.follow_count === "number" ? r.follow_count : Number(r.follow_count));
    }
  }
  return map;
}
