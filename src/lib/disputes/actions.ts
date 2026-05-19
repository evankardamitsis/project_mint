"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  DISPUTE_ASSETS_BUCKET,
  DISPUTE_ASSET_MAX_BYTES,
  DISPUTE_DESCRIPTION_MIN_LEN,
} from "@/lib/disputes/constants";
import { hasActiveDispute, orderAllowsNewDispute } from "@/lib/disputes/eligibility";
import { getProfile } from "@/lib/auth/guards";
import { hasRole } from "@/lib/roles";
import type { DisputeReason, DisputeStatus, OrderStatus, PaymentStatus } from "@/types/domain";

const REASONS_REQUIRE_EVIDENCE: DisputeReason[] = ["damaged", "not_as_described", "counterfeit"];
const ALL_REASONS: DisputeReason[] = ["damaged", "not_as_described", "not_received", "counterfeit", "other"];

function safeFileBase(name: string): string {
  return name.replace(/[^\w.\-()+]+/g, "_").slice(0, 120) || "file";
}

function isNextRedirectError(e: unknown): boolean {
  if (typeof e !== "object" || e === null || !("digest" in e)) {
    return false;
  }
  const d = (e as { digest?: unknown }).digest;
  return typeof d === "string" && d.startsWith("NEXT_REDIRECT");
}

function revalidateDisputeSurfaces(orderId: string, listingSlug?: string) {
  revalidatePath("/buyer/purchases");
  revalidatePath(`/buyer/purchases/${orderId}`);
  revalidatePath(`/buyer/purchases/${orderId}/dispute`);
  revalidatePath(`/buyer/purchases/${orderId}/dispute/new`);
  revalidatePath("/seller/orders");
  revalidatePath(`/seller/orders/${orderId}`);
  revalidatePath(`/seller/orders/${orderId}/dispute`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/dispute`);
  revalidatePath("/admin/disputes");
  if (listingSlug) {
    revalidatePath(`/listing/${listingSlug}`);
  }
}

function runAdmin<T>(fn: (admin: ReturnType<typeof createAdminClient>) => Promise<T>): Promise<T> {
  return fn(createAdminClient());
}

export type DisputeFormState = { ok: true } | { ok: false; error?: string };

export async function createDisputeAction(_prev: DisputeFormState | undefined, formData: FormData): Promise<DisputeFormState> {
  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) {
    return { ok: false, error: "Missing order." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("id, buyer_id, status, payment_status, listings ( slug )")
      .eq("id", orderId)
      .maybeSingle();
    if (oErr || !order || order.buyer_id !== user.id) {
      return { ok: false, error: "Order not found." };
    }

    if (
      !orderAllowsNewDispute({
        status: order.status as OrderStatus,
        payment_status: order.payment_status as PaymentStatus,
      })
    ) {
      return { ok: false, error: "This order is not eligible for a dispute yet." };
    }

    const { data: existingDisputes } = await supabase.from("disputes").select("id, status").eq("order_id", orderId);
    if (hasActiveDispute((existingDisputes ?? []) as { status: string }[])) {
      redirect(`/buyer/purchases/${orderId}/dispute`);
    }

    const reasonRaw = String(formData.get("reason") ?? "").trim();
    if (!ALL_REASONS.includes(reasonRaw as DisputeReason)) {
      return { ok: false, error: "Choose a valid reason." };
    }
    const reason = reasonRaw as DisputeReason;

    const description = String(formData.get("description") ?? "").trim();
    if (description.length < DISPUTE_DESCRIPTION_MIN_LEN) {
      return { ok: false, error: `Please enter at least ${DISPUTE_DESCRIPTION_MIN_LEN} characters describing the issue.` };
    }

    const files = formData.getAll("evidence").filter((f): f is File => f instanceof File && f.size > 0);
    if (REASONS_REQUIRE_EVIDENCE.includes(reason) && files.length === 0) {
      return { ok: false, error: "Upload at least one photo or document for this reason." };
    }
    if (files.length > 8) {
      return { ok: false, error: "You can upload at most 8 files." };
    }

    for (const f of files) {
      if (f.size > DISPUTE_ASSET_MAX_BYTES) {
        return { ok: false, error: "Each file must be at most 5 MB." };
      }
      const okMime =
        f.type.startsWith("image/") ||
        f.type === "application/pdf" ||
        f.type === "image/jpeg" ||
        f.type === "image/png" ||
        f.type === "image/webp" ||
        f.type === "image/gif";
      if (!okMime) {
        return { ok: false, error: "Only images (JPEG, PNG, WebP, GIF) or PDF files are allowed." };
      }
    }

    const { data: dispute, error: dErr } = await supabase
      .from("disputes")
      .insert({
        order_id: orderId,
        opened_by: user.id,
        reason,
        description,
        status: "awaiting_seller",
      })
      .select("id")
      .single();

    if (dErr || !dispute?.id) {
      console.error("[disputes] createDisputeAction insert", dErr?.message, dErr?.code);
      if (dErr?.code === "23505") {
        return { ok: false, error: "A dispute is already open for this order." };
      }
      return { ok: false, error: "Could not create the dispute. Try again." };
    }

    const disputeId = dispute.id as string;

    for (const file of files) {
      const objectPath = `${disputeId}/${Date.now()}-${safeFileBase(file.name)}`;
      const { error: upErr } = await supabase.storage.from(DISPUTE_ASSETS_BUCKET).upload(objectPath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (upErr) {
        console.error("[disputes] createDisputeAction storage", upErr.message);
        await runAdmin(async (admin) => {
          await admin.from("dispute_assets").delete().eq("dispute_id", disputeId);
          await admin.from("disputes").delete().eq("id", disputeId);
        });
        return { ok: false, error: "Could not upload evidence. Try again." };
      }

      const { error: aErr } = await supabase.from("dispute_assets").insert({
        dispute_id: disputeId,
        url: objectPath,
      });
      if (aErr) {
        console.error("[disputes] createDisputeAction asset insert", aErr.message);
        await supabase.storage.from(DISPUTE_ASSETS_BUCKET).remove([objectPath]);
        await runAdmin(async (admin) => {
          await admin.from("dispute_assets").delete().eq("dispute_id", disputeId);
          await admin.from("disputes").delete().eq("id", disputeId);
        });
        return { ok: false, error: "Could not save evidence records." };
      }
    }

    const { error: ordErr } = await runAdmin(async (admin) =>
      admin.from("orders").update({ status: "disputed" }).eq("id", orderId).eq("buyer_id", user.id),
    );
    if (ordErr) {
      console.error("[disputes] createDisputeAction order update", ordErr.message);
    }

    const rawL = order.listings as { slug: string } | { slug: string }[] | null;
    const slug = rawL ? (Array.isArray(rawL) ? rawL[0]?.slug : rawL.slug) : undefined;
    revalidateDisputeSurfaces(orderId, slug);

    redirect(`/buyer/purchases/${orderId}/dispute`);
  } catch (e) {
    if (isNextRedirectError(e)) {
      throw e;
    }
    console.error("[disputes] createDisputeAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export type SellerDisputeFormState = { ok: true } | { ok: false; error?: string };

export async function submitSellerDisputeResponseAction(
  _prev: SellerDisputeFormState | undefined,
  formData: FormData,
): Promise<SellerDisputeFormState> {
  const orderId = String(formData.get("order_id") ?? "").trim();
  const disputeId = String(formData.get("dispute_id") ?? "").trim();
  const response = String(formData.get("seller_response") ?? "").trim();
  if (!orderId || !disputeId) {
    return { ok: false, error: "Invalid request." };
  }
  if (response.length < 20) {
    return { ok: false, error: "Please write at least 20 characters in your response." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const { data: order } = await supabase.from("orders").select("id, seller_id").eq("id", orderId).maybeSingle();
    if (!order) {
      return { ok: false, error: "Order not found." };
    }
    const { data: sp } = await supabase.from("seller_profiles").select("id").eq("user_id", user.id).eq("id", order.seller_id).maybeSingle();
    if (!sp?.id) {
      return { ok: false, error: "Only the seller can respond." };
    }

    const { data: dispute } = await supabase
      .from("disputes")
      .select("id, status")
      .eq("id", disputeId)
      .eq("order_id", orderId)
      .maybeSingle();
    if (!dispute) {
      return { ok: false, error: "Dispute not found." };
    }
    const st = dispute.status as string;
    if (st !== "open" && st !== "awaiting_seller") {
      return { ok: false, error: "This dispute is not waiting for a seller response." };
    }

    const { error } = await runAdmin(async (admin) =>
      admin
        .from("disputes")
        .update({
          seller_response: response,
          seller_responded_at: new Date().toISOString(),
          status: "under_review",
        })
        .eq("id", disputeId)
        .eq("order_id", orderId)
        .in("status", ["open", "awaiting_seller"]),
    );

    if (error) {
      console.error("[disputes] submitSellerDisputeResponseAction", error.message);
      return { ok: false, error: "Could not save your response." };
    }

    revalidateDisputeSurfaces(orderId);
    return { ok: true };
  } catch (e) {
    console.error("[disputes] submitSellerDisputeResponseAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export type AdminDisputeFormState = { ok: true } | { ok: false; error?: string };

export async function adminDisputeResolutionAction(
  _prev: AdminDisputeFormState | undefined,
  formData: FormData,
): Promise<AdminDisputeFormState> {
  const profile = await getProfile();
  if (!profile || !hasRole(profile.role, "admin")) {
    return { ok: false, error: "Forbidden." };
  }

  const orderId = String(formData.get("order_id") ?? "").trim();
  const disputeId = String(formData.get("dispute_id") ?? "").trim();
  const action = String(formData.get("resolution_action") ?? "").trim();
  const resolutionNotes = String(formData.get("resolution_notes") ?? "").trim();
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!orderId || !disputeId || !action) {
    return { ok: false, error: "Missing fields." };
  }

  try {
    const supabase = await createClient();

    const { data: dispute } = await supabase.from("disputes").select("id, status").eq("id", disputeId).eq("order_id", orderId).maybeSingle();
    if (!dispute) {
      return { ok: false, error: "Dispute not found." };
    }

    const nowIso = new Date().toISOString();

    if (action === "mark_under_review") {
      const { error } = await supabase
        .from("disputes")
        .update({ status: "under_review", admin_notes: adminNotes || null })
        .eq("id", disputeId);
      if (error) {
        console.error("[disputes] admin mark_under_review", error.message);
        return { ok: false, error: "Update failed." };
      }
      revalidateDisputeSurfaces(orderId);
      return { ok: true };
    }

    if (action === "resolve_buyer") {
      if (resolutionNotes.length < 10) {
        return { ok: false, error: "Add resolution notes (at least 10 characters)." };
      }
      const { error: dErr } = await supabase
        .from("disputes")
        .update({
          status: "resolved_buyer" as DisputeStatus,
          resolution_notes: resolutionNotes,
          admin_notes: adminNotes || null,
          resolved_at: nowIso,
        })
        .eq("id", disputeId);
      if (dErr) {
        console.error("[disputes] admin resolve_buyer dispute", dErr.message);
        return { ok: false, error: "Could not resolve dispute." };
      }
      revalidateDisputeSurfaces(orderId);
      return { ok: true };
    }

    if (action === "resolve_seller") {
      if (resolutionNotes.length < 10) {
        return { ok: false, error: "Add resolution notes (at least 10 characters)." };
      }
      const { error: dErr } = await supabase
        .from("disputes")
        .update({
          status: "resolved_seller" as DisputeStatus,
          resolution_notes: resolutionNotes,
          admin_notes: adminNotes || null,
          resolved_at: nowIso,
        })
        .eq("id", disputeId);
      if (dErr) {
        console.error("[disputes] admin resolve_seller dispute", dErr.message);
        return { ok: false, error: "Could not resolve dispute." };
      }
      const { error: oErr } = await supabase
        .from("orders")
        .update({ status: "completed", payment_status: "released" })
        .eq("id", orderId);
      if (oErr) {
        console.error("[disputes] admin resolve_seller order", oErr.message);
        return { ok: false, error: "Dispute updated but order payment could not be adjusted (placeholder)." };
      }
      revalidateDisputeSurfaces(orderId);
      return { ok: true };
    }

    if (action === "mark_refunded") {
      const { error: dErr } = await supabase
        .from("disputes")
        .update({
          status: "refunded" as DisputeStatus,
          resolution_notes: resolutionNotes || "Placeholder refund — no Stripe movement.",
          admin_notes: adminNotes || null,
          resolved_at: nowIso,
        })
        .eq("id", disputeId);
      if (dErr) {
        console.error("[disputes] admin mark_refunded dispute", dErr.message);
        return { ok: false, error: "Could not update dispute." };
      }
      const { error: oErr } = await supabase
        .from("orders")
        .update({ status: "refunded", payment_status: "refunded" })
        .eq("id", orderId);
      if (oErr) {
        console.error("[disputes] admin mark_refunded order", oErr.message);
        return { ok: false, error: "Dispute updated but order could not be marked refunded." };
      }
      revalidateDisputeSurfaces(orderId);
      return { ok: true };
    }

    if (action === "close") {
      const { error } = await supabase
        .from("disputes")
        .update({
          status: "closed" as DisputeStatus,
          admin_notes: adminNotes || null,
          resolution_notes: resolutionNotes || null,
          resolved_at: nowIso,
        })
        .eq("id", disputeId);
      if (error) {
        console.error("[disputes] admin close", error.message);
        return { ok: false, error: "Could not close dispute." };
      }
      revalidateDisputeSurfaces(orderId);
      return { ok: true };
    }

    return { ok: false, error: "Unknown action." };
  } catch (e) {
    console.error("[disputes] adminDisputeResolutionAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
