"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type FavoriteActionState = { ok: true } | { ok: false; error: string };

async function validateListingForSave(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .maybeSingle();
  if (error || !listing) {
    return { ok: false, error: "That listing could not be found." };
  }
  if (listing.status !== "active") {
    return { ok: false, error: "Only live listings can be saved to your watchlist." };
  }
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("user_id")
    .eq("id", listing.seller_id as string)
    .maybeSingle();
  if (seller?.user_id === userId) {
    return { ok: false, error: "You can't save your own listing." };
  }
  return { ok: true };
}

function revalidateWatchlistSurfaces(slug?: string) {
  revalidatePath("/buyer/watchlist");
  revalidatePath("/browse");
  revalidatePath("/");
  revalidatePath("/seller/listings");
  if (slug) {
    revalidatePath(`/listing/${slug}`);
  }
}

export async function saveListingAction(listingId: string): Promise<FavoriteActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to save listings." };
  }
  const gate = await validateListingForSave(supabase, listingId, user.id);
  if (!gate.ok) {
    return gate;
  }

  const { data: listingRow } = await supabase.from("listings").select("slug").eq("id", listingId).maybeSingle();
  const slug = (listingRow?.slug as string | undefined) ?? undefined;

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId,
  });
  if (error) {
    if (error.code === "23505") {
      revalidateWatchlistSurfaces(slug);
      return { ok: true };
    }
    console.error("[favorites] saveListingAction", error.message);
    return { ok: false, error: "Could not save this listing. Try again." };
  }
  revalidateWatchlistSurfaces(slug);
  return { ok: true };
}

export async function unsaveListingAction(listingId: string): Promise<FavoriteActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to manage saved listings." };
  }

  const { data: listingRow } = await supabase.from("listings").select("slug").eq("id", listingId).maybeSingle();
  const slug = (listingRow?.slug as string | undefined) ?? undefined;

  const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
  if (error) {
    console.error("[favorites] unsaveListingAction", error.message);
    return { ok: false, error: "Could not remove this listing. Try again." };
  }
  revalidateWatchlistSurfaces(slug);
  return { ok: true };
}

export type ToggleFavoriteResult =
  | { ok: true; saved: boolean }
  | { ok: false; error: string };

export async function toggleSaveListingAction(listingId: string): Promise<ToggleFavoriteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to save listings." };
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const out = await unsaveListingAction(listingId);
    return out.ok ? { ok: true, saved: false } : { ok: false, error: out.error ?? "Could not update." };
  }

  const saved = await saveListingAction(listingId);
  return saved.ok ? { ok: true, saved: true } : { ok: false, error: saved.error ?? "Could not update." };
}
