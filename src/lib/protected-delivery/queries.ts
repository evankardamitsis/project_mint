import "server-only";

import { createClient } from "@/lib/supabase/server";

/** `protected_delivery_assets.url` = object path in `protected-delivery-assets` (not a public URL). */
import {
  PROTECTED_DELIVERY_ASSETS_BUCKET,
  PROTECTED_DELIVERY_SIGNED_URL_TTL_SEC,
} from "@/lib/protected-delivery/constants";
import type {
  ProtectedDeliveryAssetView,
  ProtectedDeliveryBundle,
  ProtectedDeliveryCheckView,
  ProtectedDeliveryShipmentView,
} from "@/types/protected-delivery";
import type { ProtectedDeliveryAssetType } from "@/types/domain";

function isHttpUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

async function signStoragePath(supabase: Awaited<ReturnType<typeof createClient>>, storagePath: string): Promise<string | null> {
  if (isHttpUrl(storagePath)) {
    return storagePath;
  }
  const { data, error } = await supabase.storage
    .from(PROTECTED_DELIVERY_ASSETS_BUCKET)
    .createSignedUrl(storagePath, PROTECTED_DELIVERY_SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) {
    console.error("[pd] signStoragePath", error?.message);
    return null;
  }
  return data.signedUrl;
}

function mapCheck(row: Record<string, unknown>): ProtectedDeliveryCheckView {
  return {
    id: row.id as string,
    order_id: row.order_id as string,
    condition_photos_uploaded: Boolean(row.condition_photos_uploaded),
    serial_number_uploaded: Boolean(row.serial_number_uploaded),
    packaging_photos_uploaded: Boolean(row.packaging_photos_uploaded),
    sealed_package_photo_uploaded: Boolean(row.sealed_package_photo_uploaded),
    tracking_added: Boolean(row.tracking_added),
    seller_notes: (row.seller_notes as string | null) ?? null,
    status: row.status as ProtectedDeliveryCheckView["status"],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function mapShipment(row: Record<string, unknown>): ProtectedDeliveryShipmentView {
  return {
    id: row.id as string,
    courier_name: (row.courier_name as string | null) ?? null,
    tracking_number: (row.tracking_number as string | null) ?? null,
    tracking_url: (row.tracking_url as string | null) ?? null,
    status: row.status as ProtectedDeliveryShipmentView["status"],
    shipped_at: (row.shipped_at as string | null) ?? null,
    delivered_at: (row.delivered_at as string | null) ?? null,
  };
}

export async function fetchProtectedDeliveryBundle(orderId: string): Promise<ProtectedDeliveryBundle | null> {
  const supabase = await createClient();

  const { data: chk, error: cErr } = await supabase
    .from("protected_delivery_checks")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (cErr) {
    console.error("[pd] fetchProtectedDeliveryBundle check", cErr.message);
    return null;
  }
  if (!chk) {
    return null;
  }

  const check = mapCheck(chk as Record<string, unknown>);

  const { data: assetRows, error: aErr } = await supabase
    .from("protected_delivery_assets")
    .select("id, type, url, created_at")
    .eq("check_id", check.id)
    .order("created_at", { ascending: true });

  if (aErr) {
    console.error("[pd] fetchProtectedDeliveryBundle assets", aErr.message);
  }

  const assets: ProtectedDeliveryAssetView[] = [];
  for (const r of assetRows ?? []) {
    const rawUrl = r.url as string;
    const signedUrl = await signStoragePath(supabase, rawUrl);
    assets.push({
      id: r.id as string,
      type: r.type as ProtectedDeliveryAssetType,
      storagePath: rawUrl,
      signedUrl,
      created_at: r.created_at as string,
    });
  }

  const { data: ship, error: sErr } = await supabase.from("shipments").select("*").eq("order_id", orderId).maybeSingle();
  if (sErr) {
    console.error("[pd] fetchProtectedDeliveryBundle shipment", sErr.message);
  }

  return {
    check,
    assets,
    shipment: ship ? mapShipment(ship as Record<string, unknown>) : null,
  };
}
