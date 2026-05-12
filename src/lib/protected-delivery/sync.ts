import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProtectedDeliveryCheckStatus } from "@/types/domain";

const terminal: ProtectedDeliveryCheckStatus[] = ["submitted", "approved", "rejected"];

/**
 * Recomputes checklist booleans from assets + shipment and advances `not_started` → `in_progress` when work exists.
 * No-op when the check is already submitted / approved / rejected.
 */
export async function recalculateProtectedDeliveryProgress(
  supabase: SupabaseClient,
  orderId: string,
  checkId: string,
): Promise<void> {
  const { data: checkRow, error: cErr } = await supabase
    .from("protected_delivery_checks")
    .select("status")
    .eq("id", checkId)
    .maybeSingle();
  if (cErr || !checkRow) {
    if (cErr) {
      console.error("[pd] recalculateProtectedDeliveryProgress check", cErr.message);
    }
    return;
  }

  const st = checkRow.status as ProtectedDeliveryCheckStatus;
  if (terminal.includes(st)) {
    return;
  }

  const { data: assets, error: aErr } = await supabase.from("protected_delivery_assets").select("type").eq("check_id", checkId);
  if (aErr) {
    console.error("[pd] recalculateProtectedDeliveryProgress assets", aErr.message);
    return;
  }

  const types = new Set((assets ?? []).map((a) => a.type as string));
  const { data: ship, error: sErr } = await supabase
    .from("shipments")
    .select("tracking_number")
    .eq("order_id", orderId)
    .maybeSingle();
  if (sErr) {
    console.error("[pd] recalculateProtectedDeliveryProgress shipment", sErr.message);
  }

  const tracking = Boolean((ship?.tracking_number as string | null | undefined)?.trim());

  const hasWork = types.size > 0 || tracking;
  let nextStatus: ProtectedDeliveryCheckStatus = st;
  if (!terminal.includes(st)) {
    if (st === "not_started") {
      nextStatus = hasWork ? "in_progress" : "not_started";
    } else if (st === "in_progress") {
      nextStatus = "in_progress";
    }
  }

  const { error: uErr } = await supabase
    .from("protected_delivery_checks")
    .update({
      condition_photos_uploaded: types.has("condition_photo"),
      serial_number_uploaded: types.has("serial_number_photo"),
      packaging_photos_uploaded: types.has("packaging_photo"),
      sealed_package_photo_uploaded: types.has("sealed_package_photo"),
      tracking_added: tracking,
      status: nextStatus,
    })
    .eq("id", checkId);

  if (uErr) {
    console.error("[pd] recalculateProtectedDeliveryProgress update", uErr.message);
  }
}
