"use server";

import { revalidatePath } from "next/cache";

import { getProfile } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  PROTECTED_DELIVERY_ASSETS_BUCKET,
  PROTECTED_DELIVERY_IMAGE_MAX_BYTES,
} from "@/lib/protected-delivery/constants";
import { recalculateProtectedDeliveryProgress } from "@/lib/protected-delivery/sync";
import type { ProtectedDeliveryAssetType, ShipmentStatus } from "@/types/domain";

const PD_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const ASSET_TYPES: ProtectedDeliveryAssetType[] = [
  "condition_photo",
  "serial_number_photo",
  "packaging_photo",
  "sealed_package_photo",
  "receipt_photo",
];

function safeImageBaseName(name: string): string {
  const base = name.replace(/[^\w.\-()+]+/g, "_");
  return base.slice(0, 120) || "upload";
}

function revalidatePdSurfaces(orderId: string) {
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath(`/buyer/purchases/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/seller/orders");
  revalidatePath("/buyer/purchases");
  revalidatePath("/admin/orders");
}

async function assertSellerOwnsOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  orderId: string,
): Promise<{ ok: true; order: { seller_id: string; status: string } } | { ok: false; error: string }> {
  const { data: order, error: oErr } = await supabase.from("orders").select("id, seller_id, status").eq("id", orderId).maybeSingle();
  if (oErr || !order) {
    return { ok: false, error: "Order not found." };
  }
  const { data: sp, error: sErr } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", userId)
    .eq("id", order.seller_id as string)
    .maybeSingle();
  if (sErr || !sp) {
    return { ok: false, error: "You do not have access to this order." };
  }
  return { ok: true, order: { seller_id: order.seller_id as string, status: order.status as string } };
}

function isAssetType(v: string): v is ProtectedDeliveryAssetType {
  return (ASSET_TYPES as string[]).includes(v);
}

export async function uploadProtectedDeliveryAssetAction(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const orderId = String(formData.get("order_id") ?? "").trim();
    const checkId = String(formData.get("check_id") ?? "").trim();
    const assetTypeRaw = String(formData.get("asset_type") ?? "").trim();
    if (!orderId || !checkId || !isAssetType(assetTypeRaw)) {
      return { ok: false, error: "Invalid upload request." };
    }

    const gate = await assertSellerOwnsOrder(supabase, user.id, orderId);
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    if (gate.order.status !== "cleared_for_shipping") {
      return { ok: false, error: "Proof uploads are only open before the order is marked shipped." };
    }

    const { data: check, error: cErr } = await supabase
      .from("protected_delivery_checks")
      .select("id, status")
      .eq("id", checkId)
      .eq("order_id", orderId)
      .maybeSingle();
    if (cErr || !check) {
      return { ok: false, error: "Checklist not found." };
    }
    const cst = check.status as string;
    if (cst === "submitted" || cst === "approved" || cst === "rejected") {
      return { ok: false, error: "This checklist is locked." };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size <= 0) {
      return { ok: false, error: "Choose an image file to upload." };
    }
    if (file.size > PROTECTED_DELIVERY_IMAGE_MAX_BYTES) {
      return { ok: false, error: "Each image must be at most 5 MB." };
    }
    if (!PD_MIME.has(file.type)) {
      return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
    }

    const objectPath = `${orderId}/${assetTypeRaw}/${Date.now()}-${safeImageBaseName(file.name)}`;
    const { error: upErr } = await supabase.storage.from(PROTECTED_DELIVERY_ASSETS_BUCKET).upload(objectPath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) {
      console.error("[pd] uploadProtectedDeliveryAssetAction storage", upErr.message);
      return { ok: false, error: "Could not upload the file. Try again." };
    }

    const { error: insErr } = await supabase.from("protected_delivery_assets").insert({
      check_id: checkId,
      type: assetTypeRaw,
      url: objectPath,
    });
    if (insErr) {
      console.error("[pd] uploadProtectedDeliveryAssetAction insert", insErr.message);
      await supabase.storage.from(PROTECTED_DELIVERY_ASSETS_BUCKET).remove([objectPath]);
      return { ok: false, error: "Could not save the proof record." };
    }

    await recalculateProtectedDeliveryProgress(supabase, orderId, checkId);
    revalidatePdSurfaces(orderId);
    return { ok: true };
  } catch (e) {
    console.error("[pd] uploadProtectedDeliveryAssetAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function deleteProtectedDeliveryAssetAction(assetId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const profile = await getProfile();
    if (!profile || profile.role !== "admin") {
      return { ok: false, error: "Only an admin can remove proof assets." };
    }

    const admin = createAdminClient();
    const { data: row, error: aErr } = await admin
      .from("protected_delivery_assets")
      .select("id, url, check_id")
      .eq("id", assetId)
      .maybeSingle();
    if (aErr || !row) {
      return { ok: false, error: "Asset not found." };
    }

    const path = row.url as string;
    if (!path.startsWith("http://") && !path.startsWith("https://")) {
      const { error: rmErr } = await admin.storage.from(PROTECTED_DELIVERY_ASSETS_BUCKET).remove([path]);
      if (rmErr) {
        console.error("[pd] deleteProtectedDeliveryAssetAction storage", rmErr.message);
      }
    }

    const { data: chk } = await admin.from("protected_delivery_checks").select("id, order_id").eq("id", row.check_id as string).maybeSingle();
    const orderId = chk?.order_id as string | undefined;

    const { error: dErr } = await admin.from("protected_delivery_assets").delete().eq("id", assetId);
    if (dErr) {
      console.error("[pd] deleteProtectedDeliveryAssetAction delete", dErr.message);
      return { ok: false, error: "Could not delete the asset." };
    }

    if (orderId && chk?.id) {
      await recalculateProtectedDeliveryProgress(admin, orderId, chk.id as string);
    }
    if (orderId) {
      revalidatePdSurfaces(orderId);
    }
    return { ok: true };
  } catch (e) {
    console.error("[pd] deleteProtectedDeliveryAssetAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function updateProtectedDeliveryChecklistStatusAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const gate = await assertSellerOwnsOrder(supabase, user.id, orderId);
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }

    const { data: check, error: cErr } = await supabase.from("protected_delivery_checks").select("id").eq("order_id", orderId).maybeSingle();
    if (cErr || !check?.id) {
      return { ok: false, error: "No checklist found for this order." };
    }

    await recalculateProtectedDeliveryProgress(supabase, orderId, check.id as string);
    revalidatePdSurfaces(orderId);
    return { ok: true };
  } catch (e) {
    console.error("[pd] updateProtectedDeliveryChecklistStatusAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function saveShipmentTrackingAction(
  orderId: string,
  input: { courierName: string; trackingNumber: string; trackingUrl: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const gate = await assertSellerOwnsOrder(supabase, user.id, orderId);
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    if (gate.order.status !== "cleared_for_shipping" && gate.order.status !== "shipped") {
      return { ok: false, error: "Tracking can only be edited at this stage for paid, shipping-eligible orders." };
    }

    const trackingNumber = input.trackingNumber.trim();
    if (!trackingNumber) {
      return { ok: false, error: "Tracking number is required." };
    }

    const { data: existing } = await supabase.from("shipments").select("id, status, shipped_at, delivered_at").eq("order_id", orderId).maybeSingle();

    const preserveTransit =
      existing?.status === "in_transit" ||
      existing?.status === "delivered" ||
      gate.order.status === "shipped";

    let nextStatus: ShipmentStatus = "pending";
    if (preserveTransit) {
      const s = (existing?.status as ShipmentStatus | undefined) ?? "pending";
      if (s === "in_transit" || s === "delivered" || s === "failed" || s === "returned") {
        nextStatus = s;
      } else {
        nextStatus = "in_transit";
      }
    }

    const payload = {
      order_id: orderId,
      courier_name: input.courierName.trim() || null,
      tracking_number: trackingNumber,
      tracking_url: input.trackingUrl.trim() || null,
      status: nextStatus,
      shipped_at: preserveTransit ? ((existing?.shipped_at as string | null) ?? null) : null,
      delivered_at: preserveTransit ? ((existing?.delivered_at as string | null) ?? null) : null,
    };

    if (existing?.id) {
      const { error: upErr } = await supabase.from("shipments").update(payload).eq("id", existing.id as string);
      if (upErr) {
        console.error("[pd] saveShipmentTrackingAction", upErr.message);
        return { ok: false, error: "Could not save tracking." };
      }
    } else {
      const { error: upErr } = await supabase.from("shipments").insert({
        order_id: orderId,
        courier_name: payload.courier_name,
        tracking_number: payload.tracking_number,
        tracking_url: payload.tracking_url,
        status: "pending",
      });
      if (upErr) {
        console.error("[pd] saveShipmentTrackingAction insert", upErr.message);
        return { ok: false, error: "Could not save tracking." };
      }
    }

    const { data: check } = await supabase.from("protected_delivery_checks").select("id").eq("order_id", orderId).maybeSingle();
    if (check?.id) {
      await recalculateProtectedDeliveryProgress(supabase, orderId, check.id as string);
    }

    revalidatePdSurfaces(orderId);
    return { ok: true };
  } catch (e) {
    console.error("[pd] saveShipmentTrackingAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function submitProtectedDeliveryChecklistAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const gate = await assertSellerOwnsOrder(supabase, user.id, orderId);
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    if (gate.order.status !== "cleared_for_shipping") {
      return { ok: false, error: "This order is not waiting for shipment proof." };
    }

    const { data: check, error: cErr } = await supabase
      .from("protected_delivery_checks")
      .select("id, status")
      .eq("order_id", orderId)
      .maybeSingle();
    if (cErr || !check?.id) {
      return { ok: false, error: "No checklist found." };
    }
    if ((check.status as string) === "submitted") {
      return { ok: false, error: "This checklist was already submitted." };
    }

    await recalculateProtectedDeliveryProgress(supabase, orderId, check.id as string);

    const { data: chk2 } = await supabase
      .from("protected_delivery_checks")
      .select("condition_photos_uploaded, packaging_photos_uploaded, sealed_package_photo_uploaded, tracking_added")
      .eq("id", check.id)
      .maybeSingle();
    if (
      !chk2?.condition_photos_uploaded ||
      !chk2?.packaging_photos_uploaded ||
      !chk2?.sealed_package_photo_uploaded ||
      !chk2?.tracking_added
    ) {
      return {
        ok: false,
        error: "Add condition photos, packaging photos, a sealed-package photo, and tracking before submitting.",
      };
    }

    const nowIso = new Date().toISOString();
    const admin = createAdminClient();

    const { data: shipRow } = await admin.from("shipments").select("*").eq("order_id", orderId).maybeSingle();
    if (!shipRow?.tracking_number || !String(shipRow.tracking_number).trim()) {
      return { ok: false, error: "Save tracking with a tracking number before submitting." };
    }

    const { error: oErr } = await admin.from("orders").update({ status: "shipped" }).eq("id", orderId).eq("status", "cleared_for_shipping");
    if (oErr) {
      console.error("[pd] submitProtectedDeliveryChecklistAction order", oErr.message);
      return { ok: false, error: "Could not mark the order as shipped." };
    }

    const { error: ckErr } = await admin
      .from("protected_delivery_checks")
      .update({ status: "submitted" })
      .eq("id", check.id)
      .in("status", ["not_started", "in_progress"]);
    if (ckErr) {
      console.error("[pd] submitProtectedDeliveryChecklistAction check", ckErr.message);
      await admin.from("orders").update({ status: "cleared_for_shipping" }).eq("id", orderId);
      return { ok: false, error: "Could not submit the checklist." };
    }

    const shipmentUpsert: Record<string, unknown> = {
      order_id: orderId,
      courier_name: (shipRow.courier_name as string | null) ?? null,
      tracking_number: String(shipRow.tracking_number).trim(),
      tracking_url: (shipRow.tracking_url as string | null) ?? null,
      status: "in_transit",
      shipped_at: nowIso,
      delivered_at: (shipRow.delivered_at as string | null) ?? null,
    };
    if (shipRow.id) {
      shipmentUpsert.id = shipRow.id;
    }

    const { error: shErr } = await admin.from("shipments").upsert(shipmentUpsert, { onConflict: "order_id" });
    if (shErr) {
      console.error("[pd] submitProtectedDeliveryChecklistAction shipment", shErr.message);
      await admin.from("orders").update({ status: "cleared_for_shipping" }).eq("id", orderId);
      await admin.from("protected_delivery_checks").update({ status: "in_progress" }).eq("id", check.id);
      return { ok: false, error: "Could not update shipment status." };
    }

    revalidatePdSurfaces(orderId);
    return { ok: true };
  } catch (e) {
    console.error("[pd] submitProtectedDeliveryChecklistAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
