import { createClient } from "@/lib/supabase/server";

import type {
  AdminListingRow,
  BrandOption,
  CategoryOption,
  ListingCardData,
  ListingDetailData,
  ListingImageRow,
  SellerListingEditData,
  SellerProfileFull,
} from "@/types/listings";
import type { ListingCondition, ListingStatus } from "@/types/domain";

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
    | { display_name?: string }
    | { display_name?: string }[]
    | null
    | undefined;
  const one = Array.isArray(raw) ? raw[0] : raw;
  const name = one?.display_name?.trim();
  return name || null;
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
      "id, user_id, display_name, bio, location, phone, verification_status, payout_status, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[listings] fetchSellerProfileForUser", error.message);
    return null;
  }
  return data as SellerProfileFull | null;
}

export type BrowseQueryParams = {
  q?: string;
  category?: string;
  brand?: string;
  condition?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
};

export async function fetchBrowseListings(
  params: BrowseQueryParams,
): Promise<ListingCardData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name )",
    )
    .eq("status", "active");

  const q = params.q?.trim().slice(0, 120) ?? "";
  if (q.length > 0) {
    const safe = escapeIlike(q);
    query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();
    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (params.brand) {
    const { data: br } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", params.brand)
      .maybeSingle();
    if (br?.id) {
      query = query.eq("brand_id", br.id);
    }
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
      query = query.eq("condition", params.condition as ListingCondition);
    }
  }

  const minEur = params.min_price?.trim();
  if (minEur && /^\d+(\.\d{1,2})?$/.test(minEur)) {
    const cents = Math.round(Number.parseFloat(minEur) * 100);
    query = query.gte("price_cents", cents);
  }

  const maxEur = params.max_price?.trim();
  if (maxEur && /^\d+(\.\d{1,2})?$/.test(maxEur)) {
    const cents = Math.round(Number.parseFloat(maxEur) * 100);
    query = query.lte("price_cents", cents);
  }

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

  return (data ?? []).map((row) => {
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
    };
  });
}

export async function fetchHomeListings(limit = 8): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name )",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listings] fetchHomeListings", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
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
    };
  });
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
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name )",
    )
    .eq("status", "active")
    .eq("category_id", cat.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listings] fetchHomeListingsByCategorySlug", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
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
    };
  });
}

export async function fetchSellerListings(
  sellerProfileId: string,
): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, protected_delivery_enabled, categories ( name, slug ), listing_images ( id, url, sort_order ), seller_profiles ( display_name )",
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listings] fetchSellerListings", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
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
      seller_profiles ( display_name, completed_sales_count, average_rating ),
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
    images,
  };
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
  return (data ?? []).map((raw) => {
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
}
