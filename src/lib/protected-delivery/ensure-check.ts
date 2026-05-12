import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ensures a protected_delivery_checks row exists for the order (idempotent).
 * Uses the service role because RLS restricts inserts to admins.
 */
export async function ensureProtectedDeliveryCheckForOrder(orderId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: existing, error: exErr } = await admin
    .from("protected_delivery_checks")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();
  if (exErr) {
    console.error("[pd] ensureProtectedDeliveryCheckForOrder select", exErr.message);
  }
  if (existing?.id) {
    return existing.id as string;
  }

  const { data: inserted, error: insErr } = await admin
    .from("protected_delivery_checks")
    .insert({
      order_id: orderId,
      condition_photos_uploaded: false,
      serial_number_uploaded: false,
      packaging_photos_uploaded: false,
      sealed_package_photo_uploaded: false,
      tracking_added: false,
      status: "not_started",
    })
    .select("id")
    .single();

  if (!insErr && inserted?.id) {
    return inserted.id as string;
  }

  if (insErr?.code === "23505") {
    const { data: raced } = await admin.from("protected_delivery_checks").select("id").eq("order_id", orderId).maybeSingle();
    return raced?.id ? (raced.id as string) : null;
  }

  console.error("[pd] ensureProtectedDeliveryCheckForOrder insert", insErr?.message);
  return null;
}

/** Creates the checklist row when payment is held and the order is in a post-payment shipping phase. */
export async function ensureProtectedDeliveryCheckIfPaymentHeld(order: {
  id: string;
  status: string;
  payment_status: string;
}): Promise<void> {
  if (order.payment_status !== "held") {
    return;
  }
  if (!["cleared_for_shipping", "shipped", "delivered", "completed"].includes(order.status)) {
    return;
  }
  await ensureProtectedDeliveryCheckForOrder(order.id);
}
