"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fetchBuyerWatchlistListings } from "@/lib/favorites/queries";
import type { ListingCardData } from "@/types/listings";

export type ToggleWatchResult =
  | { watching: boolean; error?: undefined }
  | { watching?: undefined; error: string };

export async function toggleWatch(listingId: string): Promise<ToggleWatchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Πρέπει να συνδεθείς για να αποθηκεύσεις αγγελίες." };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, slug, seller_id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing || listing.status !== "active") {
    return { error: "Η αγγελία δεν είναι διαθέσιμη." };
  }

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("user_id")
    .eq("id", listing.seller_id as string)
    .maybeSingle();

  if (seller?.user_id === user.id) {
    return { error: "Δεν μπορείς να αποθηκεύσεις τη δική σου αγγελία." };
  }

  const slug = listing.slug as string | undefined;

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);
    if (error) {
      return { error: "Δεν ήταν δυνατή η αφαίρεση." };
    }
    revalidateWatchSurfaces(slug);
    return { watching: false };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    listing_id: listingId,
  });
  if (error && error.code !== "23505") {
    return { error: "Δεν ήταν δυνατή η αποθήκευση." };
  }
  revalidateWatchSurfaces(slug);
  return { watching: true };
}

function revalidateWatchSurfaces(slug?: string) {
  revalidatePath("/buyer/watchlist");
  revalidatePath("/browse");
  revalidatePath("/");
  revalidatePath("/seller/listings");
  if (slug) {
    revalidatePath(`/listing/${slug}`);
  }
}

export async function getWatchStatus(listingId: string): Promise<{
  watching: boolean;
  count: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: watch }, { data: countData }] = await Promise.all([
    user
      ? supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.rpc("listing_watcher_count_public", { p_listing_id: listingId }),
  ]);

  const countRaw = countData;
  const count =
    typeof countRaw === "number"
      ? countRaw
      : countRaw != null
        ? Number(countRaw)
        : 0;

  return {
    watching: Boolean(watch),
    count: Number.isFinite(count) ? count : 0,
  };
}

export async function getUserWatchlist(): Promise<ListingCardData[]> {
  return fetchBuyerWatchlistListings();
}
