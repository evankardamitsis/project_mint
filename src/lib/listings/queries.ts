import type { BrowseQueryParams } from "@/lib/listings/browse-params";
import { browsePriceDropsMode } from "@/lib/listings/browse-params";
import { createClient } from "@/lib/supabase/server";

import {
  fetchSavedListingIdsForUser,
  fetchSellerWatcherCountsByListingId,
} from "@/lib/favorites/queries";
import {
  attachPublicPriceDropToCard,
  attachPublicPriceDropToDetail,
  fetchBrowsePriceDropOrder,
  fetchPublicPriceDropSignalsForListingIds,
  fetchSellerPriceDropInsights,
} from "@/lib/listings/price-drop";
import type {
  AdminListingRow,
  BrandOption,
  CategoryOption,
  ListingCardData,
  ListingDetailData,
  ListingImageRow,
  ListingPriceHistoryRow,
  SellerListingEditData,
  SellerProfileFull,
} from "@/types/listings";
import type { ListingCondition, ListingStatus, SellerTier } from "@/types/domain";

function sortImages(
  images: ListingImageRow[] | null | undefined,
): ListingImageRow[] {
  if (!images?.length) {
    return [];
  }
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

function primaryImageUrl(
  images: ListingImageRow[] | null | undefined,
): string | null {
  const sorted = sortImages(images);
  return sorted[0]?.url ?? null;
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function sellerDisplayNameFromRow(row: {
  seller_profiles: unknown;
}): string | null {
  const raw = row.seller_profiles as
    | { display_name?: string; user_id?: string }
    | { display_name?: string; user_id?: string }[]
    | null
    | undefined;
  const one = Array.isArray(raw) ? raw[0] : raw;
  const name = one?.display_name?.trim();
  return name || null;
}

function sellerTierFromRow(row: { seller_profiles: unknown }): SellerTier | null {
  const raw = row.seller_profiles as
    | { seller_tier?: string }
    | { seller_tier?: string }[]
    | null
    | undefined;
  const one = Array.isArray(raw) ? raw[0] : raw;
  const t = one?.seller_tier;
  if (t === "trusted" || t === "top" || t === "new") {
    return t;
  }
  return null;
}

function sellerOwnerUserIdFromRow(row: { seller_profiles: unknown }): string | null {
  const raw = row.seller_profiles as
    | { user_id?: string }
    | { user_id?: string }[]
    | null
    | undefined;
  const one = Array.isArray(raw) ? raw[0] : raw;
  const id = one?.user_id?.trim();
  return id || null;
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return null;
}

export type { BrowseQueryParams } from "@/lib/listings/browse-params";
export { browsePriceDropsMode } from "@/lib/listings/browse-params";

const browseListingSelect =
  "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name, user_id, seller_tier )";

type BrowseFilterResolution = { categoryId?: string; brandId?: string };

async function resolveBrowseCategoryBrandIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: BrowseQueryParams,
): Promise<BrowseFilterResolution> {
  const out: BrowseFilterResolution = {};
  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    if (cat?.id) {
      out.categoryId = cat.id as string;
    }
  }
  if (params.brand) {
    const { data: br } = await supabase.from("brands").select("id").eq("slug", params.brand).maybeSingle();
    if (br?.id) {
      out.brandId = br.id as string;
    }
  }
  return out;
}

/** Text + facet filters on an active-listings browse query (sync — Postgrest builder is thenable). */
function applyBrowseListingFiltersSync(
  query: unknown,
  params: BrowseQueryParams,
  resolved: BrowseFilterResolution,
): unknown {
  type QB = {
    or: (s: string) => QB;
    eq: (col: string, val: unknown) => QB;
    gte: (col: string, val: number) => QB;
    lte: (col: string, val: number) => QB;
    in: (col: string, vals: string[]) => QB;
    order: (col: string, opts: { ascending: boolean }) => QB;
  };
  let q = query as QB;
  const text = params.q?.trim().slice(0, 120) ?? "";
  if (text.length > 0) {
    const safe = escapeIlike(text);
    q = q.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (resolved.categoryId) {
    q = q.eq("category_id", resolved.categoryId);
  }

  if (resolved.brandId) {
    q = q.eq("brand_id", resolved.brandId);
  }

  if (params.condition) {
    const allowed: ListingCondition[] = [
      "brand_new",
      "mint",
      "excellent",
      "very_good",
      "good",
      "fair",
      "poor",
      "non_functioning",
    ];
    if (allowed.includes(params.condition as ListingCondition)) {
      q = q.eq("condition", params.condition as ListingCondition);
    }
  }

  const minEur = params.min_price?.trim();
  if (minEur && /^\d+(\.\d{1,2})?$/.test(minEur)) {
    const cents = Math.round(Number.parseFloat(minEur) * 100);
    q = q.gte("price_cents", cents);
  }

  const maxEur = params.max_price?.trim();
  if (maxEur && /^\d+(\.\d{1,2})?$/.test(maxEur)) {
    const cents = Math.round(Number.parseFloat(maxEur) * 100);
    q = q.lte("price_cents", cents);
  }

  return q;
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) {
    console.error("[listings] fetchCategories", error.message);
    return [];
  }
  return (data ?? []) as CategoryOption[];
}

export async function fetchBrands(): Promise<BrandOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error) {
    console.error("[listings] fetchBrands", error.message);
    return [];
  }
  return (data ?? []) as BrandOption[];
}

export async function fetchSellerProfileForUser(): Promise<SellerProfileFull | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("seller_profiles")
    .select(
      "id, user_id, display_name, bio, location, phone, verification_status, payout_status, seller_tier, completed_sales_count, average_rating, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[listings] fetchSellerProfileForUser", error.message);
    return null;
  }
  return data as SellerProfileFull | null;
}

export async function fetchBrowseListings(
  params: BrowseQueryParams,
): Promise<ListingCardData[]> {
  const supabase = await createClient();

  const mapBrowseRows = (
    rows: {
      id: unknown;
      title: unknown;
      slug: unknown;
      price_cents: unknown;
      currency: unknown;
      condition: unknown;
      location: unknown;
      status: unknown;
      created_at: unknown;
      protected_delivery_enabled: unknown;
      categories: unknown;
      listing_images: ListingImageRow[] | null | undefined;
      seller_profiles: unknown;
    }[],
  ): ListingCardData[] =>
    rows.map((row) => {
      const images = row.listing_images as ListingImageRow[] | null | undefined;
      const catRaw = row.categories as
        | { name?: string; slug?: string }
        | { name?: string; slug?: string }[]
        | null
        | undefined;
      const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
      return {
        id: row.id as string,
        title: row.title as string,
        slug: row.slug as string,
        price_cents: row.price_cents as number,
        currency: (row.currency as string) ?? "EUR",
        condition: row.condition as ListingCondition,
        location: (row.location as string | null) ?? null,
        status: row.status as ListingCardData["status"],
        created_at: row.created_at as string,
        primary_image_url: primaryImageUrl(images),
        protected_delivery_enabled: Boolean(row.protected_delivery_enabled),
        category_name: cat?.name ?? null,
        category_slug: cat?.slug ?? null,
        seller_display_name: sellerDisplayNameFromRow(row),
        seller_owner_user_id: sellerOwnerUserIdFromRow(row),
        seller_tier: sellerTierFromRow(row),
      };
    });

  if (browsePriceDropsMode(params)) {
    const ordered = await fetchBrowsePriceDropOrder(supabase);
    if (ordered.length === 0) {
      return [];
    }
    const orderedIds = ordered.map((o) => o.listing_id);
    const resolved = await resolveBrowseCategoryBrandIds(supabase, params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Postgrest builder is thenable; sync helper returns unknown to avoid async auto-await.
    const q: any = applyBrowseListingFiltersSync(
      supabase.from("listings").select(browseListingSelect).eq("status", "active").in("id", orderedIds),
      params,
      resolved,
    );
    const { data, error } = await q;
    if (error) {
      console.error("[listings] fetchBrowseListings price drops", error.message);
      return [];
    }
    let mapped = mapBrowseRows(data ?? []);
    const idSet = new Set(mapped.map((m) => m.id));
    const orderedFiltered = ordered.filter((o) => idSet.has(o.listing_id));
    const idx = new Map(orderedFiltered.map((o, i) => [o.listing_id, i]));
    mapped = [...mapped].sort((a, b) => (idx.get(a.id) ?? 1e9) - (idx.get(b.id) ?? 1e9));
    const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, mapped.map((r) => r.id));
    const saved = await fetchSavedListingIdsForUser(mapped.map((r) => r.id));
    return mapped.map((r) =>
      attachPublicPriceDropToCard({ ...r, is_saved_by_current_user: saved.has(r.id) }, signals.get(r.id)),
    );
  }

  const resolved = await resolveBrowseCategoryBrandIds(supabase, params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Postgrest builder is thenable; sync helper returns unknown to avoid async auto-await.
  let query: any = applyBrowseListingFiltersSync(
    supabase.from("listings").select(browseListingSelect).eq("status", "active"),
    params,
    resolved,
  );

  const sort = params.sort ?? "newest";
  if (sort === "price_asc") {
    query = query.order("price_cents", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price_cents", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[listings] fetchBrowseListings", error.message);
    return [];
  }

  const mapped = mapBrowseRows(data ?? []);
  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, mapped.map((r) => r.id));
  const saved = await fetchSavedListingIdsForUser(mapped.map((r) => r.id));
  return mapped.map((r) =>
    attachPublicPriceDropToCard({ ...r, is_saved_by_current_user: saved.has(r.id) }, signals.get(r.id)),
  );
}

export async function fetchHomeListings(limit = 8): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      browseListingSelect,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listings] fetchHomeListings", error.message);
    return [];
  }
  const mapped = (data ?? []).map((row) => {
    const images = row.listing_images as ListingImageRow[] | null | undefined;
    const catRaw = row.categories as
      | { name?: string; slug?: string }
      | { name?: string; slug?: string }[]
      | null
      | undefined;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) ?? "EUR",
      condition: row.condition as ListingCondition,
      location: (row.location as string | null) ?? null,
      status: row.status as ListingCardData["status"],
      created_at: row.created_at as string,
      primary_image_url: primaryImageUrl(images),
      protected_delivery_enabled: Boolean(row.protected_delivery_enabled),
      category_name: cat?.name ?? null,
      category_slug: cat?.slug ?? null,
      seller_display_name: sellerDisplayNameFromRow(row),
      seller_owner_user_id: sellerOwnerUserIdFromRow(row),
      seller_tier: sellerTierFromRow(row),
    };
  });
  const saved = await fetchSavedListingIdsForUser(mapped.map((r) => r.id));
  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, mapped.map((r) => r.id));
  return mapped.map((r) =>
    attachPublicPriceDropToCard({ ...r, is_saved_by_current_user: saved.has(r.id) }, signals.get(r.id)),
  );
}

export type HomeMarketStats = {
  activeListings: number;
  activeSellerShops: number;
};

export async function fetchHomeMarketStats(): Promise<HomeMarketStats> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  if (error) {
    console.error("[listings] fetchHomeMarketStats count", error.message);
    return { activeListings: 0, activeSellerShops: 0 };
  }
  const { data: rows, error: rowErr } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("status", "active");
  if (rowErr) {
    console.error("[listings] fetchHomeMarketStats sellers", rowErr.message);
    return { activeListings: count ?? 0, activeSellerShops: 0 };
  }
  const activeSellerShops = new Set((rows ?? []).map((r) => r.seller_id as string)).size;
  return { activeListings: count ?? 0, activeSellerShops };
}

export async function fetchHomeListingsByCategorySlug(
  categorySlug: string,
  limit: number,
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).maybeSingle();
  if (!cat?.id) {
    return [];
  }
  const { data, error } = await supabase
    .from("listings")
    .select(browseListingSelect)
    .eq("status", "active")
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listings] fetchHomeListingsByCategorySlug", error.message);
    return [];
  }
  const mapped = (data ?? []).map((row) => {
    const images = row.listing_images as ListingImageRow[] | null | undefined;
    const catRaw = row.categories as
      | { name?: string; slug?: string }
      | { name?: string; slug?: string }[]
      | null
      | undefined;
    const c = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) ?? "EUR",
      condition: row.condition as ListingCondition,
      location: (row.location as string | null) ?? null,
      status: row.status as ListingCardData["status"],
      created_at: row.created_at as string,
      primary_image_url: primaryImageUrl(images),
      protected_delivery_enabled: Boolean(row.protected_delivery_enabled),
      category_name: c?.name ?? null,
      category_slug: c?.slug ?? null,
      seller_display_name: sellerDisplayNameFromRow(row),
      seller_owner_user_id: sellerOwnerUserIdFromRow(row),
      seller_tier: sellerTierFromRow(row),
    };
  });
  const saved = await fetchSavedListingIdsForUser(mapped.map((r) => r.id));
  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, mapped.map((r) => r.id));
  return mapped.map((r) =>
    attachPublicPriceDropToCard({ ...r, is_saved_by_current_user: saved.has(r.id) }, signals.get(r.id)),
  );
}

export async function fetchSellerListings(
  sellerProfileId: string,
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name, user_id )",
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listings] fetchSellerListings", error.message);
    return [];
  }
  const mapped = (data ?? []).map((row) => {
    const images = row.listing_images as ListingImageRow[] | null | undefined;
    const catRaw = row.categories as
      | { name?: string; slug?: string }
      | { name?: string; slug?: string }[]
      | null
      | undefined;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) ?? "EUR",
      condition: row.condition as ListingCondition,
      location: (row.location as string | null) ?? null,
      status: row.status as ListingCardData["status"],
      created_at: row.created_at as string,
      primary_image_url: primaryImageUrl(images),
      protected_delivery_enabled: Boolean(row.protected_delivery_enabled),
      category_name: cat?.name ?? null,
      category_slug: cat?.slug ?? null,
      seller_display_name: sellerDisplayNameFromRow(row),
      seller_owner_user_id: sellerOwnerUserIdFromRow(row),
    };
  });

  const counts = await fetchSellerWatcherCountsByListingId();
  const insights = await fetchSellerPriceDropInsights(supabase);
  return mapped.map((r) => {
    const ins = insights.get(r.id);
    return {
      ...r,
      watcher_count: counts.get(r.id) ?? 0,
      latest_price_drop_percent: ins?.drop_percent ?? null,
      latest_price_drop_old_price_cents: null,
      latest_price_drop_created_at: ins?.last_drop_at ?? null,
    };
  });
}

type ListingDetailRow = {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingDetailData["status"];
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  created_at: string;
  published_at: string | null;
  rejection_reason: string | null;
  categories: { id: string; name: string; slug: string } | null;
  brands: { id: string; name: string; slug: string } | null;
  seller_profiles: {
    display_name: string;
    completed_sales_count?: number | null;
    average_rating?: number | null;
    seller_tier?: string | null;
  } | null;
  listing_images: ListingImageRow[] | null;
};

export async function fetchListingBySlug(
  slug: string,
): Promise<ListingDetailData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      seller_id,
      title,
      slug,
      description,
      condition,
      price_cents,
      currency,
      location,
      status,
      offers_enabled,
      protected_delivery_enabled,
      created_at,
      published_at,
      rejection_reason,
      categories ( id, name, slug ),
      brands ( id, name, slug ),
      seller_profiles ( display_name, completed_sales_count, average_rating, seller_tier ),
      listing_images ( id, listing_id, url, sort_order, created_at )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[listings] fetchListingBySlug", error.message);
    return null;
  }
  if (!data) {
    return null;
  }

  const row = data as unknown as ListingDetailRow;
  const images = sortImages(row.listing_images ?? undefined);

  const category = Array.isArray(row.categories)
    ? (row.categories[0] ?? null)
    : row.categories;
  const brand = Array.isArray(row.brands)
    ? (row.brands[0] ?? null)
    : row.brands;
  const seller = Array.isArray(row.seller_profiles)
    ? (row.seller_profiles[0] ?? null)
    : row.seller_profiles;

  const sellerSales = parseFiniteNumber(seller?.completed_sales_count);
  const sellerRating = parseFiniteNumber(seller?.average_rating);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let is_saved_by_current_user = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", row.id)
      .maybeSingle();
    is_saved_by_current_user = Boolean(fav);
  }

  const base: ListingDetailData = {
    id: row.id,
    seller_id: row.seller_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    condition: row.condition,
    price_cents: row.price_cents,
    currency: row.currency ?? "EUR",
    location: row.location,
    status: row.status,
    offers_enabled: row.offers_enabled,
    protected_delivery_enabled: row.protected_delivery_enabled,
    created_at: row.created_at,
    published_at: row.published_at,
    rejection_reason: row.rejection_reason ?? null,
    category,
    brand,
    seller_display_name: seller?.display_name ?? "Seller",
    seller_sales_count:
      sellerSales != null ? Math.max(0, Math.floor(sellerSales)) : null,
    seller_rating: sellerRating,
    seller_tier:
      seller?.seller_tier === "trusted" || seller?.seller_tier === "top" || seller?.seller_tier === "new"
        ? seller.seller_tier
        : "new",
    images,
    is_saved_by_current_user,
  };

  if (row.status !== "active") {
    return attachPublicPriceDropToDetail(base, undefined);
  }
  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, [row.id]);
  return attachPublicPriceDropToDetail(base, signals.get(row.id));
}

export async function fetchSellerListingStats(sellerId: string): Promise<{
  total: number;
  active: number;
  pending_review: number;
  sold: number;
}> {
  const supabase = await createClient();
  const countFor = async (status?: ListingStatus) => {
    let q = supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerId);
    if (status) {
      q = q.eq("status", status);
    }
    const { count, error } = await q;
    if (error) {
      console.error("[listings] fetchSellerListingStats", error.message);
      return 0;
    }
    return count ?? 0;
  };
  const [total, active, pending_review, sold] = await Promise.all([
    countFor(),
    countFor("active"),
    countFor("pending_review"),
    countFor("sold"),
  ]);
  return { total, active, pending_review, sold };
}

/** Active offers + in-flight orders for seller shop hub (counts only). */
export async function fetchSellerHubCounts(sellerProfileId: string): Promise<{
  activeOffers: number;
  activeOrders: number;
}> {
  const supabase = await createClient();
  const activeOrderStatuses = [
    "pending_payment",
    "paid",
    "cleared_for_shipping",
    "shipped",
    "delivered",
    "disputed",
  ] as const;
  const [offersRes, ordersRes] = await Promise.all([
    supabase
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerProfileId)
      .in("status", ["pending", "countered"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", sellerProfileId)
      .in("status", [...activeOrderStatuses]),
  ]);
  if (offersRes.error) {
    console.error("[listings] fetchSellerHubCounts offers", offersRes.error.message);
  }
  if (ordersRes.error) {
    console.error("[listings] fetchSellerHubCounts orders", ordersRes.error.message);
  }
  return {
    activeOffers: offersRes.count ?? 0,
    activeOrders: ordersRes.count ?? 0,
  };
}

type SellerListingEditRow = {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingStatus;
  category_id: string;
  brand_id: string | null;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  listing_images: ListingImageRow[] | null;
};

export async function fetchListingPriceHistoryForSeller(
  listingId: string,
): Promise<ListingPriceHistoryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_price_history")
    .select("id, old_price_cents, new_price_cents, change_percent, created_at")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) {
    console.error("[listings] fetchListingPriceHistoryForSeller", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id as string,
    old_price_cents: r.old_price_cents as number,
    new_price_cents: r.new_price_cents as number,
    change_percent: parseFiniteNumber(r.change_percent),
    created_at: r.created_at as string,
  }));
}

export async function fetchSellerListingForEdit(
  listingId: string,
): Promise<SellerListingEditData | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      seller_id,
      title,
      slug,
      description,
      condition,
      price_cents,
      currency,
      location,
      status,
      category_id,
      brand_id,
      offers_enabled,
      protected_delivery_enabled,
      listing_images ( id, listing_id, url, sort_order, created_at )
    `,
    )
    .eq("id", listingId)
    .maybeSingle();
  if (error) {
    console.error("[listings] fetchSellerListingForEdit", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  const row = data as unknown as SellerListingEditRow;
  const price_history = await fetchListingPriceHistoryForSeller(row.id);
  return {
    id: row.id,
    seller_id: row.seller_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    condition: row.condition,
    price_cents: row.price_cents,
    currency: row.currency ?? "EUR",
    location: row.location,
    status: row.status,
    category_id: row.category_id,
    brand_id: row.brand_id,
    offers_enabled: row.offers_enabled,
    protected_delivery_enabled: row.protected_delivery_enabled,
    images: sortImages(row.listing_images ?? undefined),
    price_history: price_history.length > 0 ? price_history : undefined,
  };
}

type AdminListingQueryRow = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  condition: ListingCondition;
  status: ListingStatus;
  created_at: string;
  categories: { name: string } | null | { name: string }[];
  seller_profiles: { display_name: string } | null | { display_name: string }[];
  listing_images: ListingImageRow[] | null;
};

export async function fetchAdminListings(
  filter: ListingStatus | "all",
): Promise<AdminListingRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("listings")
    .select(
      `
      id,
      title,
      slug,
      price_cents,
      currency,
      condition,
      status,
      created_at,
      categories ( name ),
      seller_profiles ( display_name ),
      listing_images ( url, sort_order )
    `,
    )
    .order("created_at", { ascending: false });
  if (filter !== "all") {
    q = q.eq("status", filter);
  }
  const { data, error } = await q;
  if (error) {
    console.error("[listings] fetchAdminListings", error.message);
    return [];
  }
  const rows = (data ?? []).map((raw) => {
    const row = raw as unknown as AdminListingQueryRow;
    const cat = Array.isArray(row.categories)
      ? row.categories[0]
      : row.categories;
    const seller = Array.isArray(row.seller_profiles)
      ? row.seller_profiles[0]
      : row.seller_profiles;
    const images = row.listing_images as ListingImageRow[] | null | undefined;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      price_cents: row.price_cents,
      currency: row.currency ?? "EUR",
      condition: row.condition,
      status: row.status,
      created_at: row.created_at,
      seller_display_name: seller?.display_name ?? "Seller",
      category_name: cat?.name ?? null,
      primary_image_url: primaryImageUrl(images),
    };
  });
  const activeIds = rows.filter((r) => r.status === "active").map((r) => r.id);
  const signals = await fetchPublicPriceDropSignalsForListingIds(supabase, activeIds);
  return rows.map((r) => ({
    ...r,
    latest_price_drop_percent:
      r.status === "active" ? (signals.get(r.id)?.drop_percent ?? null) : null,
  }));
}
