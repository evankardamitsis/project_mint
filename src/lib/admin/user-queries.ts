/**
 * Admin-scoped queries for viewing any user's activity.
 * These bypass session checks — callers must ensure the viewer is an admin.
 */

import { createClient } from "@/lib/supabase/server";
import { formatEuroPrefix } from "@/lib/utils";
import type { ListingStatus, OfferStatus, OrderStatus, PaymentStatus } from "@/types/domain";

// ─── shared helpers ──────────────────────────────────────────────────────────

function primaryImageUrl(images: { url: string; sort_order: number }[] | null | undefined) {
  if (!images?.length) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0]!.url;
}

function coerceSingle<T>(raw: unknown): T | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return (raw[0] as T) ?? null;
  return raw as T;
}

// ─── types ───────────────────────────────────────────────────────────────────

export type AdminUserOrderRow = {
  id: string;
  listing_title: string;
  listing_slug: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  counterparty_label: string;
  created_at: string;
};

export type AdminUserListingRow = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  status: ListingStatus;
  category_name: string | null;
  created_at: string;
};

export type AdminUserOfferRow = {
  id: string;
  listing_title: string;
  listing_slug: string;
  amount_cents: number;
  currency: string;
  status: OfferStatus;
  counterparty_label: string;
  created_at: string;
};

export type AdminUserSellerProfile = {
  id: string;
  display_name: string;
  location: string | null;
  verification_status: string;
};

// ─── seller profile ───────────────────────────────────────────────────────────

export async function fetchAdminSellerProfile(
  userId: string,
): Promise<AdminUserSellerProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_profiles")
    .select("id, display_name, location, verification_status")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id as string,
    display_name: data.display_name as string,
    location: (data.location as string | null) ?? null,
    verification_status: data.verification_status as string,
  };
}

// ─── purchases (buyer orders) ─────────────────────────────────────────────────

export async function fetchAdminUserPurchases(
  userId: string,
  limit = 5,
): Promise<AdminUserOrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, amount_cents, currency, status, payment_status, created_at,
       listings ( title, slug ),
       seller_profiles ( display_name )`,
    )
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/user-queries] fetchAdminUserPurchases", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const listing = coerceSingle<{ title: string; slug: string }>(row.listings);
    const seller = coerceSingle<{ display_name: string }>(row.seller_profiles);
    return {
      id: row.id as string,
      listing_title: listing?.title ?? "—",
      listing_slug: listing?.slug ?? "",
      amount_cents: row.amount_cents as number,
      currency: (row.currency as string) ?? "EUR",
      status: row.status as OrderStatus,
      payment_status: row.payment_status as PaymentStatus,
      counterparty_label: seller?.display_name ?? "—",
      created_at: row.created_at as string,
    };
  });
}

// ─── sales (seller orders) ────────────────────────────────────────────────────

export async function fetchAdminUserSales(
  sellerProfileId: string,
  limit = 5,
): Promise<AdminUserOrderRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, buyer_id, amount_cents, currency, status, payment_status, created_at,
       listings ( title, slug )`,
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/user-queries] fetchAdminUserSales", error.message);
    return [];
  }

  const rows = data ?? [];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id as string))];
  const buyerMap = new Map<string, string>();

  if (buyerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", buyerIds);
    for (const p of profiles ?? []) {
      const label =
        (p.full_name as string | null)?.trim() ||
        (p.email as string | null)?.trim() ||
        "Αγοραστής";
      buyerMap.set(p.id as string, label);
    }
  }

  return rows.map((row) => {
    const listing = coerceSingle<{ title: string; slug: string }>(row.listings);
    return {
      id: row.id as string,
      listing_title: listing?.title ?? "—",
      listing_slug: listing?.slug ?? "",
      amount_cents: row.amount_cents as number,
      currency: (row.currency as string) ?? "EUR",
      status: row.status as OrderStatus,
      payment_status: row.payment_status as PaymentStatus,
      counterparty_label: buyerMap.get(row.buyer_id as string) ?? "Αγοραστής",
      created_at: row.created_at as string,
    };
  });
}

// ─── listings ─────────────────────────────────────────────────────────────────

export async function fetchAdminUserListings(
  sellerProfileId: string,
  limit = 5,
): Promise<AdminUserListingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(`id, title, slug, price_cents, currency, status, created_at, categories ( name )`)
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/user-queries] fetchAdminUserListings", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const cat = coerceSingle<{ name: string }>(row.categories);
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      price_cents: row.price_cents as number,
      currency: (row.currency as string) ?? "EUR",
      status: row.status as ListingStatus,
      category_name: cat?.name ?? null,
      created_at: row.created_at as string,
    };
  });
}

// ─── buyer offers ─────────────────────────────────────────────────────────────

export async function fetchAdminUserBuyerOffers(
  userId: string,
  limit = 5,
): Promise<AdminUserOfferRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      `id, amount_cents, currency, status, created_at,
       listings ( title, slug, currency )`,
    )
    .eq("buyer_id", userId)
    .is("parent_offer_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/user-queries] fetchAdminUserBuyerOffers", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const listing = coerceSingle<{ title: string; slug: string; currency: string | null }>(
      row.listings,
    );
    return {
      id: row.id as string,
      listing_title: listing?.title ?? "—",
      listing_slug: listing?.slug ?? "",
      amount_cents: row.amount_cents as number,
      currency: (listing?.currency ?? row.currency ?? "EUR") as string,
      status: row.status as OfferStatus,
      counterparty_label: "—",
      created_at: row.created_at as string,
    };
  });
}

// ─── seller offers ────────────────────────────────────────────────────────────

export async function fetchAdminUserSellerOffers(
  sellerProfileId: string,
  limit = 5,
): Promise<AdminUserOfferRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      `id, buyer_id, amount_cents, currency, status, created_at,
       listings ( title, slug, currency )`,
    )
    .eq("seller_id", sellerProfileId)
    .is("parent_offer_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[admin/user-queries] fetchAdminUserSellerOffers", error.message);
    return [];
  }

  const rows = data ?? [];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id as string))];
  const buyerMap = new Map<string, string>();

  if (buyerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", buyerIds);
    for (const p of profiles ?? []) {
      const label =
        (p.full_name as string | null)?.trim() ||
        (p.email as string | null)?.trim() ||
        "Αγοραστής";
      buyerMap.set(p.id as string, label);
    }
  }

  return rows.map((row) => {
    const listing = coerceSingle<{ title: string; slug: string; currency: string | null }>(
      row.listings,
    );
    return {
      id: row.id as string,
      listing_title: listing?.title ?? "—",
      listing_slug: listing?.slug ?? "",
      amount_cents: row.amount_cents as number,
      currency: (listing?.currency ?? row.currency ?? "EUR") as string,
      status: row.status as OfferStatus,
      counterparty_label: buyerMap.get(row.buyer_id as string) ?? "Αγοραστής",
      created_at: row.created_at as string,
    };
  });
}

// ─── formatting helper (re-exported for the page) ────────────────────────────

export { formatEuroPrefix };
