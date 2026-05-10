import { createClient } from "@/lib/supabase/server";

import type {
  BrandOption,
  CategoryOption,
  ListingCardData,
  ListingDetailData,
  ListingImageRow,
  SellerProfileRow,
} from "@/types/listings";
import type { ListingCondition } from "@/types/domain";

function sortImages(images: ListingImageRow[] | null | undefined): ListingImageRow[] {
  if (!images?.length) {
    return [];
  }
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

function primaryImageUrl(images: ListingImageRow[] | null | undefined): string | null {
  const sorted = sortImages(images);
  return sorted[0]?.url ?? null;
}

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
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

export async function fetchSellerProfileForUser(): Promise<SellerProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("id, user_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[listings] fetchSellerProfileForUser", error.message);
    return null;
  }
  return data as SellerProfileRow | null;
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
      "id, title, slug, price_cents, currency, condition, status, location, created_at, listing_images ( id, url, sort_order )",
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
    };
  });
}

export async function fetchHomeListings(limit = 8): Promise<ListingCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, status, location, created_at, listing_images ( id, url, sort_order )",
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
      "id, title, slug, price_cents, currency, condition, status, location, created_at, listing_images ( id, url, sort_order )",
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listings] fetchSellerListings", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
    const images = row.listing_images as ListingImageRow[] | null | undefined;
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
  categories: { id: string; name: string; slug: string } | null;
  brands: { id: string; name: string; slug: string } | null;
  seller_profiles: { display_name: string } | null;
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
      categories ( id, name, slug ),
      brands ( id, name, slug ),
      seller_profiles ( display_name ),
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
    ? row.categories[0] ?? null
    : row.categories;
  const brand = Array.isArray(row.brands) ? row.brands[0] ?? null : row.brands;
  const seller = Array.isArray(row.seller_profiles)
    ? row.seller_profiles[0] ?? null
    : row.seller_profiles;

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
    category,
    brand,
    seller_display_name: seller?.display_name ?? "Seller",
    images,
  };
}
