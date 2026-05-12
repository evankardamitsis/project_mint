import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DISPUTE_ASSETS_BUCKET, DISPUTE_SIGNED_URL_TTL_SEC } from "@/lib/disputes/constants";
import { pickActiveDispute } from "@/lib/disputes/eligibility";
import type { ListingImageRow } from "@/types/listings";
import type { DisputeDetailBundle, DisputeListRow, DisputeRow, DisputeAssetView } from "@/types/disputes";
import type { DisputeReason, DisputeStatus } from "@/types/domain";

function sortImages(images: ListingImageRow[] | null | undefined): ListingImageRow[] {
  if (!images?.length) {
    return [];
  }
  return [...images].sort((a, b) => a.sort_order - b.sort_order);
}

function primaryImageUrl(images: ListingImageRow[] | null | undefined): string | null {
  return sortImages(images)[0]?.url ?? null;
}

function isHttpUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

async function signDisputePath(supabase: Awaited<ReturnType<typeof createClient>>, storagePath: string): Promise<string | null> {
  if (isHttpUrl(storagePath)) {
    return storagePath;
  }
  const { data, error } = await supabase.storage
    .from(DISPUTE_ASSETS_BUCKET)
    .createSignedUrl(storagePath, DISPUTE_SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) {
    console.error("[disputes] signDisputePath", error?.message);
    return null;
  }
  return data.signedUrl;
}

function mapDisputeRow(r: Record<string, unknown>): DisputeRow {
  return {
    id: r.id as string,
    order_id: r.order_id as string,
    opened_by: r.opened_by as string,
    reason: r.reason as DisputeReason,
    description: (r.description as string | null) ?? null,
    status: r.status as DisputeStatus,
    resolution_notes: (r.resolution_notes as string | null) ?? null,
    admin_notes: (r.admin_notes as string | null) ?? null,
    seller_response: (r.seller_response as string | null) ?? null,
    seller_responded_at: (r.seller_responded_at as string | null) ?? null,
    resolved_at: (r.resolved_at as string | null) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
}

export async function fetchDisputeDetailBundleForOrder(orderId: string): Promise<DisputeDetailBundle | null> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("disputes")
    .select(
      `
      id,
      order_id,
      opened_by,
      reason,
      description,
      status,
      resolution_notes,
      admin_notes,
      seller_response,
      seller_responded_at,
      resolved_at,
      created_at,
      updated_at,
      dispute_assets ( id, url, created_at ),
      orders (
        id,
        status,
        payment_status,
        buyer_id,
        seller_id,
        currency,
        listings ( title, slug, listing_images ( id, url, sort_order ) )
      )
    `,
    )
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[disputes] fetchDisputeDetailBundleForOrder", error.message);
    return null;
  }

  const list = (rows ?? []) as Record<string, unknown>[];
  if (!list.length) {
    return null;
  }

  const active = pickActiveDispute(
    list.map((r) => ({ id: r.id as string, status: r.status as string })),
  );
  const chosen = active ? list.find((r) => r.id === active.id) : list[0];
  if (!chosen) {
    return null;
  }

  const rawOrder = chosen.orders as Record<string, unknown> | Record<string, unknown>[] | null;
  const orderObj = Array.isArray(rawOrder) ? rawOrder[0] : rawOrder;
  if (!orderObj) {
    return null;
  }

  const rawListing = orderObj.listings as { title?: string; slug?: string; listing_images?: ListingImageRow[] } | null;
  const listing = Array.isArray(rawListing) ? rawListing[0] : rawListing;

  const rawAssets = chosen.dispute_assets as { id: string; url: string; created_at: string }[] | null;
  const assets: DisputeAssetView[] = [];
  for (const a of rawAssets ?? []) {
    const signedUrl = await signDisputePath(supabase, a.url);
    assets.push({
      id: a.id,
      storagePath: a.url,
      signedUrl,
      created_at: a.created_at,
    });
  }

  return {
    dispute: mapDisputeRow(chosen),
    assets,
    order: {
      id: orderObj.id as string,
      status: orderObj.status as string,
      payment_status: orderObj.payment_status as string,
      buyer_id: orderObj.buyer_id as string,
      seller_id: orderObj.seller_id as string,
      listing_title: listing?.title ?? "—",
      listing_slug: listing?.slug ?? "",
      listing_image_url: primaryImageUrl(listing?.listing_images),
      currency: (orderObj.currency as string) ?? "EUR",
    },
  };
}

export async function fetchDisputesForAdmin(statusFilter: string | null): Promise<DisputeListRow[]> {
  const supabase = await createClient();

  let q = supabase
    .from("disputes")
    .select(
      `
      id,
      order_id,
      reason,
      status,
      created_at,
      orders (
        buyer_id,
        seller_id,
        listings ( title, listing_images ( id, url, sort_order ) )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    q = q.eq("status", statusFilter);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[disputes] fetchDisputesForAdmin", error.message);
    return [];
  }

  const rows = data ?? [];
  const buyerIds = new Set<string>();
  const sellerIds = new Set<string>();
  for (const r of rows) {
    const oRaw = r.orders as unknown;
    const o = (Array.isArray(oRaw) ? oRaw[0] : oRaw) as { buyer_id?: string; seller_id?: string } | undefined;
    if (o?.buyer_id) {
      buyerIds.add(o.buyer_id);
    }
    if (o?.seller_id) {
      sellerIds.add(o.seller_id);
    }
  }

  const buyerMap = new Map<string, string>();
  if (buyerIds.size) {
    const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", [...buyerIds]);
    for (const p of profs ?? []) {
      buyerMap.set(
        p.id as string,
        (p.full_name as string | null)?.trim() || (p.email as string | null)?.trim() || "Buyer",
      );
    }
  }

  const sellerMap = new Map<string, string>();
  if (sellerIds.size) {
    const { data: sps } = await supabase.from("seller_profiles").select("id, display_name").in("id", [...sellerIds]);
    for (const s of sps ?? []) {
      sellerMap.set(s.id as string, (s.display_name as string) || "Seller");
    }
  }

  return rows.map((r) => {
    const oRaw = r.orders as unknown;
    const o = (Array.isArray(oRaw) ? oRaw[0] : oRaw) as {
      buyer_id: string;
      seller_id: string;
      listings: { title?: string; listing_images?: ListingImageRow[] } | null | { title?: string; listing_images?: ListingImageRow[] }[] | undefined;
    } | null | undefined;
    if (!o) {
      return {
        id: r.id as string,
        order_id: r.order_id as string,
        reason: r.reason as DisputeReason,
        status: r.status as DisputeStatus,
        created_at: r.created_at as string,
        listing_title: null,
        listing_image_url: null,
        buyer_label: "Buyer",
        seller_label: "Seller",
      };
    }
    const listingRaw = o.listings;
    const listing = Array.isArray(listingRaw) ? listingRaw[0] : listingRaw;
    return {
      id: r.id as string,
      order_id: r.order_id as string,
      reason: r.reason as DisputeReason,
      status: r.status as DisputeStatus,
      created_at: r.created_at as string,
      listing_title: listing?.title ?? null,
      listing_image_url: primaryImageUrl(listing?.listing_images),
      buyer_label: buyerMap.get(o.buyer_id) ?? "Buyer",
      seller_label: sellerMap.get(o.seller_id) ?? "Seller",
    };
  });
}

export async function fetchShipmentForOrder(orderId: string): Promise<{
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: string;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("courier_name, tracking_number, tracking_url, status")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) {
    console.error("[disputes] fetchShipmentForOrder", error.message);
    return null;
  }
  if (!data) {
    return null;
  }
  return {
    courier_name: (data.courier_name as string | null) ?? null,
    tracking_number: (data.tracking_number as string | null) ?? null,
    tracking_url: (data.tracking_url as string | null) ?? null,
    status: data.status as string,
  };
}
