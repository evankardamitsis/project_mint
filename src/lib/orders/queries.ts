import { createClient } from "@/lib/supabase/server";

import { pickActiveDispute } from "@/lib/disputes/eligibility";
import type { ListingImageRow } from "@/types/listings";
import type { OrderDetail, OrderListRow } from "@/types/orders";
import type { DisputeStatus, OrderStatus, PaymentStatus, ProtectedDeliveryCheckStatus } from "@/types/domain";

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

type ListingJoin = {
  id: string;
  title: string;
  slug: string;
  listing_images: ListingImageRow[] | null;
};

function coerceListing(raw: unknown): ListingJoin | null {
  if (raw == null) {
    return null;
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    return first && typeof first === "object" ? (first as ListingJoin) : null;
  }
  if (typeof raw === "object") {
    return raw as ListingJoin;
  }
  return null;
}

function coerceSellerName(raw: unknown): string {
  if (raw == null) {
    return "Seller";
  }
  if (Array.isArray(raw)) {
    const first = raw[0] as { display_name?: string } | undefined;
    return first?.display_name ?? "Seller";
  }
  const o = raw as { display_name?: string };
  return o.display_name ?? "Seller";
}

function coercePdCheckStatus(
  raw: unknown,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): ProtectedDeliveryCheckStatus | null {
  if (raw != null) {
    if (Array.isArray(raw)) {
      const first = raw[0];
      if (first && typeof first === "object" && "status" in first) {
        return first.status as ProtectedDeliveryCheckStatus;
      }
    } else if (typeof raw === "object" && "status" in raw) {
      return (raw as { status: string }).status as ProtectedDeliveryCheckStatus;
    }
  }
  if (orderStatus === "cleared_for_shipping" && paymentStatus === "held") {
    return "not_started";
  }
  return null;
}

function coerceActiveDispute(raw: unknown): { id: string; status: DisputeStatus } | null {
  if (raw == null) {
    return null;
  }
  const rows = (Array.isArray(raw) ? raw : [raw]).filter(
    (x): x is { id: string; status: string } =>
      Boolean(x) && typeof x === "object" && "id" in (x as object) && "status" in (x as object),
  );
  const a = pickActiveDispute(rows);
  if (!a) {
    return null;
  }
  return { id: a.id, status: a.status as DisputeStatus };
}

function hasDisputeRecords(raw: unknown): boolean {
  if (raw == null) {
    return false;
  }
  if (Array.isArray(raw)) {
    return raw.length > 0;
  }
  if (typeof raw === "object" && "id" in (raw as object)) {
    return true;
  }
  return false;
}

function mapOrderRow(
  row: Record<string, unknown>,
  counterpartyLabel: string,
): OrderListRow {
  const listing = coerceListing(row.listings);
  const orderStatus = row.status as OrderStatus;
  const paymentStatus = row.payment_status as PaymentStatus;
  return {
    id: row.id as string,
    listing_id: row.listing_id as string,
    listing_title: listing?.title ?? "—",
    listing_slug: listing?.slug ?? "",
    listing_image_url: primaryImageUrl(listing?.listing_images ?? undefined),
    amount_cents: row.amount_cents as number,
    platform_fee_cents: row.platform_fee_cents as number,
    protected_delivery_fee_cents: row.protected_delivery_fee_cents as number,
    currency: (row.currency as string) ?? "EUR",
    status: orderStatus,
    payment_status: paymentStatus,
    created_at: row.created_at as string,
    counterparty_label: counterpartyLabel,
    pd_check_status: coercePdCheckStatus(row.protected_delivery_checks, orderStatus, paymentStatus),
    active_dispute: coerceActiveDispute(row.disputes),
    has_dispute: hasDisputeRecords(row.disputes),
  };
}

export async function fetchBuyerOrders(): Promise<OrderListRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] fetchBuyerOrders", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    mapOrderRow(row as Record<string, unknown>, coerceSellerName((row as { seller_profiles: unknown }).seller_profiles)),
  );
}

export async function fetchSellerOrders(sellerProfileId: string): Promise<OrderListRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .eq("seller_id", sellerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] fetchSellerOrders", error.message);
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
      console.error("[orders] fetchSellerOrders profiles", pErr.message);
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
    const buyer = buyerMap.get(row.buyer_id as string);
    const label = buyer?.full_name?.trim() || buyer?.email?.trim() || "Buyer";
    return mapOrderRow(row as Record<string, unknown>, label);
  });
}

export async function fetchAdminOrders(): Promise<OrderListRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] fetchAdminOrders", error.message);
    return [];
  }

  const rows = data ?? [];
  const buyerIds = [...new Set(rows.map((r) => r.buyer_id as string))];
  const buyerMap = new Map<string, string>();
  if (buyerIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", buyerIds);
    for (const p of profiles ?? []) {
      const label =
        (p.full_name as string | null)?.trim() ||
        (p.email as string | null)?.trim() ||
        (p.id as string).slice(0, 8);
      buyerMap.set(p.id as string, label);
    }
  }

  return rows.map((row) => {
    const seller = coerceSellerName((row as { seller_profiles: unknown }).seller_profiles);
    const buyerLabel = buyerMap.get(row.buyer_id as string) ?? "Buyer";
    return mapOrderRow(row as Record<string, unknown>, `${buyerLabel} · ${seller}`);
  });
}

export async function fetchOrderDetailForBuyer(orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: row, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .eq("id", orderId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (error || !row) {
    if (error) {
      console.error("[orders] fetchOrderDetailForBuyer", error.message);
    }
    return null;
  }

  const r = row as Record<string, unknown>;
  const base = mapOrderRow(r, coerceSellerName(r.seller_profiles));
  return {
    ...base,
    buyer_id: r.buyer_id as string,
    seller_id: r.seller_id as string,
    offer_id: (r.offer_id as string | null) ?? null,
    buyer_full_name: null,
    buyer_email: null,
    seller_display_name: base.counterparty_label,
  };
}

export async function fetchOrderDetailForSeller(orderId: string, sellerProfileId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .eq("id", orderId)
    .eq("seller_id", sellerProfileId)
    .maybeSingle();

  if (error || !row) {
    if (error) {
      console.error("[orders] fetchOrderDetailForSeller", error.message);
    }
    return null;
  }

  const r = row as Record<string, unknown>;
  const { data: buyer } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", r.buyer_id as string)
    .maybeSingle();

  const base = mapOrderRow(
    r,
    buyer?.full_name?.trim() || buyer?.email?.trim() || "Buyer",
  );
  return {
    ...base,
    buyer_id: r.buyer_id as string,
    seller_id: r.seller_id as string,
    offer_id: (r.offer_id as string | null) ?? null,
    buyer_full_name: (buyer?.full_name as string | null) ?? null,
    buyer_email: (buyer?.email as string | null) ?? null,
    seller_display_name: coerceSellerName(r.seller_profiles),
  };
}

export async function fetchOrderDetailForAdmin(orderId: string): Promise<OrderDetail | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      offer_id,
      amount_cents,
      platform_fee_cents,
      protected_delivery_fee_cents,
      currency,
      status,
      payment_status,
      created_at,
      listings ( id, title, slug, listing_images ( id, url, sort_order ) ),
      seller_profiles ( display_name ),
      protected_delivery_checks ( status ),
      disputes ( id, status )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !row) {
    if (error) {
      console.error("[orders] fetchOrderDetailForAdmin", error.message);
    }
    return null;
  }

  const r = row as Record<string, unknown>;
  const { data: buyer } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", r.buyer_id as string)
    .maybeSingle();

  const base = mapOrderRow(
    r,
    buyer?.full_name?.trim() || buyer?.email?.trim() || "Buyer",
  );
  return {
    ...base,
    buyer_id: r.buyer_id as string,
    seller_id: r.seller_id as string,
    offer_id: (r.offer_id as string | null) ?? null,
    buyer_full_name: (buyer?.full_name as string | null) ?? null,
    buyer_email: (buyer?.email as string | null) ?? null,
    seller_display_name: coerceSellerName(r.seller_profiles),
  };
}
