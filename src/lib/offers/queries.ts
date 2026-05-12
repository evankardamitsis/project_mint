import { createClient } from "@/lib/supabase/server";

import type { BuyerOfferRow, OfferListingSummary, SellerOfferRow } from "@/types/offers";
import type { ListingImageRow } from "@/types/listings";

function sortImages(images: ListingImageRow[] | null | undefined): ListingImageRow[] {
  if (!images?.length) {
    return [];
  }
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

type ListingJoinRow = {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string | null;
  listing_images: ListingImageRow[] | null;
};

function coerceListingJoin(raw: unknown): ListingJoinRow | null {
  if (raw == null) {
    return null;
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    return first && typeof first === "object" ? (first as ListingJoinRow) : null;
  }
  if (typeof raw === "object") {
    return raw as ListingJoinRow;
  }
  return null;
}

function primaryFromNested(listing: ListingJoinRow | null | undefined): OfferListingSummary | null {
  if (!listing) {
    return null;
  }
  const imgs = sortImages(listing.listing_images ?? undefined);
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    price_cents: listing.price_cents,
    currency: listing.currency ?? "EUR",
    primary_image_url: imgs[0]?.url ?? null,
  };
}

/** Mark past-due pending/countered offers as expired (MVP, no cron). */
export async function syncExpiredOffersForUser(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }
  const nowIso = new Date().toISOString();

  const { error: buyerErr } = await supabase
    .from("offers")
    .update({ status: "expired" })
    .eq("buyer_id", user.id)
    .in("status", ["pending", "countered"])
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);
  if (buyerErr) {
    console.error("[offers] syncExpiredOffersForUser buyer batch", buyerErr.message);
  }

  const { data: sellerProfile, error: spErr } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (spErr || !sellerProfile?.id) {
    return;
  }

  const { error: sellerErr } = await supabase
    .from("offers")
    .update({ status: "expired" })
    .eq("seller_id", sellerProfile.id)
    .in("status", ["pending", "countered"])
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);
  if (sellerErr) {
    console.error("[offers] syncExpiredOffersForUser seller batch", sellerErr.message);
  }
}

export async function fetchBuyerOffers(): Promise<BuyerOfferRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("offers")
    .select(
      `
      id,
      listing_id,
      amount_cents,
      status,
      parent_offer_id,
      expires_at,
      created_at,
      listings (
        id,
        title,
        slug,
        price_cents,
        currency,
        listing_images ( id, url, sort_order )
      )
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[offers] fetchBuyerOffers", error.message);
    return [];
  }

  const rows = data ?? [];
  const acceptedIds = rows
    .filter((r) => (r.status as string) === "accepted")
    .map((r) => r.id as string);
  const orderByOffer = new Map<string, string>();
  if (acceptedIds.length > 0) {
    const { data: ordRows, error: ordErr } = await supabase
      .from("orders")
      .select("id, offer_id")
      .eq("buyer_id", user.id)
      .in("offer_id", acceptedIds);
    if (ordErr) {
      console.error("[offers] fetchBuyerOffers orders", ordErr.message);
    } else {
      for (const o of ordRows ?? []) {
        const oid = o.offer_id as string | null;
        if (oid) {
          orderByOffer.set(oid, o.id as string);
        }
      }
    }
  }

  return rows.map((row) => {
    const listing = coerceListingJoin(row.listings);
    const id = row.id as string;
    return {
      id,
      listing_id: row.listing_id as string,
      amount_cents: row.amount_cents as number,
      status: row.status as BuyerOfferRow["status"],
      parent_offer_id: (row.parent_offer_id as string | null) ?? null,
      expires_at: (row.expires_at as string | null) ?? null,
      created_at: row.created_at as string,
      listings: primaryFromNested(listing),
      order_id: orderByOffer.get(id) ?? null,
    };
  });
}

export async function fetchSellerOffers(sellerProfileId: string): Promise<SellerOfferRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      amount_cents,
      status,
      parent_offer_id,
      expires_at,
      created_at,
      listings (
        id,
        title,
        slug,
        price_cents,
        currency,
        listing_images ( id, url, sort_order )
      )
    `,
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[offers] fetchSellerOffers", error.message);
    return [];
  }

  const rows = data ?? [];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id as string))];
  const buyerMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (buyerIds.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", buyerIds);
    if (pErr) {
      console.error("[offers] fetchSellerOffers profiles", pErr.message);
    } else {
      for (const p of profiles ?? []) {
        buyerMap.set(p.id as string, {
          full_name: (p.full_name as string | null) ?? null,
          email: (p.email as string | null) ?? null,
        });
      }
    }
  }

  return rows.map((row) => {
    const listing = coerceListingJoin(row.listings);
    const buyer = buyerMap.get(row.buyer_id as string);
    return {
      id: row.id as string,
      listing_id: row.listing_id as string,
      buyer_id: row.buyer_id as string,
      amount_cents: row.amount_cents as number,
      status: row.status as SellerOfferRow["status"],
      parent_offer_id: (row.parent_offer_id as string | null) ?? null,
      expires_at: (row.expires_at as string | null) ?? null,
      created_at: row.created_at as string,
      listings: primaryFromNested(listing),
      buyer_full_name: buyer?.full_name ?? null,
      buyer_email: buyer?.email ?? null,
    };
  });
}
