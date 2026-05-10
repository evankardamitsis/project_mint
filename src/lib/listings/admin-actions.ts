"use server";

import { revalidatePath } from "next/cache";

import { getProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { ListingStatus } from "@/types/domain";

export type SimpleActionState = { ok: boolean; error?: string };

function revalidateListingEverywhere(slug: string, listingId: string) {
  revalidatePath("/browse");
  revalidatePath("/");
  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${listingId}/edit`);
  revalidatePath(`/listing/${slug}`);
  revalidatePath("/admin/listings");
}

async function requireAdminClient() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false as const, error: "Not authorized." };
  }
  const supabase = await createClient();
  return { ok: true as const, supabase, profile };
}

export async function adminApproveListingAction(listingId: string): Promise<SimpleActionState> {
  try {
    const gate = await requireAdminClient();
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    const { data: row, error: fErr } = await gate.supabase
      .from("listings")
      .select("id, slug")
      .eq("id", listingId)
      .maybeSingle();
    if (fErr || !row) {
      return { ok: false, error: "Listing not found." };
    }
    const { error } = await gate.supabase
      .from("listings")
      .update({
        status: "active" as ListingStatus,
        published_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("id", listingId);
    if (error) {
      console.error("[admin] approve listing", error.message);
      return { ok: false, error: "Could not approve listing." };
    }
    revalidateListingEverywhere(row.slug as string, listingId);
    return { ok: true };
  } catch (e) {
    console.error("[admin] approve listing", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function adminRejectListingAction(
  listingId: string,
  reason: string,
): Promise<SimpleActionState> {
  try {
    const gate = await requireAdminClient();
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    const trimmed = reason.trim().slice(0, 2000);
    const { data: row, error: fErr } = await gate.supabase
      .from("listings")
      .select("id, slug")
      .eq("id", listingId)
      .maybeSingle();
    if (fErr || !row) {
      return { ok: false, error: "Listing not found." };
    }
    const { error } = await gate.supabase
      .from("listings")
      .update({
        status: "rejected" as ListingStatus,
        rejection_reason: trimmed.length > 0 ? trimmed : null,
        published_at: null,
      })
      .eq("id", listingId);
    if (error) {
      console.error("[admin] reject listing", error.message);
      return { ok: false, error: "Could not reject listing." };
    }
    revalidateListingEverywhere(row.slug as string, listingId);
    return { ok: true };
  } catch (e) {
    console.error("[admin] reject listing", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function adminArchiveListingAction(listingId: string): Promise<SimpleActionState> {
  try {
    const gate = await requireAdminClient();
    if (!gate.ok) {
      return { ok: false, error: gate.error };
    }
    const { data: row, error: fErr } = await gate.supabase
      .from("listings")
      .select("id, slug")
      .eq("id", listingId)
      .maybeSingle();
    if (fErr || !row) {
      return { ok: false, error: "Listing not found." };
    }
    const { error } = await gate.supabase
      .from("listings")
      .update({ status: "archived" as ListingStatus })
      .eq("id", listingId);
    if (error) {
      console.error("[admin] archive listing", error.message);
      return { ok: false, error: "Could not archive listing." };
    }
    revalidateListingEverywhere(row.slug as string, listingId);
    return { ok: true };
  } catch (e) {
    console.error("[admin] archive listing", e);
    return { ok: false, error: "Something went wrong." };
  }
}
