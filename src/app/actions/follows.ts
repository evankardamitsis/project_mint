"use server";

import { revalidatePath } from "next/cache";

import { fetchBuyerFollowListings } from "@/lib/follows/queries";
import { createClient } from "@/lib/supabase/server";
import type { ListingCardData } from "@/types/listings";

export type ToggleFollowResult =
  | { following: boolean; error?: undefined }
  | { following?: undefined; error: string };

export async function toggleFollow(listingId: string): Promise<ToggleFollowResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Πρέπει να συνδεθείς για να ακολουθήσεις αγγελία." };
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
    return { error: "Δεν μπορείς να ακολουθήσεις τη δική σου αγγελία." };
  }

  const slug = listing.slug as string | undefined;

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("follows").delete().eq("id", existing.id);
    if (error) {
      return { error: "Δεν ήταν δυνατή η αφαίρεση." };
    }
    revalidateFollowSurfaces(slug);
    return { following: false };
  }

  const { error } = await supabase.from("follows").insert({
    user_id: user.id,
    listing_id: listingId,
  });
  if (error && error.code !== "23505") {
    return { error: "Δεν ήταν δυνατή η ακολούθηση." };
  }
  revalidateFollowSurfaces(slug);
  return { following: true };
}

function revalidateFollowSurfaces(slug?: string) {
  revalidatePath("/buyer/follows");
  revalidatePath("/browse");
  revalidatePath("/");
  revalidatePath("/seller/listings");
  if (slug) {
    revalidatePath(`/listing/${slug}`);
  }
}

export async function getFollowStatus(listingId: string): Promise<{
  following: boolean;
  count: number;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: follow }, { data: countData }] = await Promise.all([
    user
      ? supabase
          .from("follows")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("listing_follow_counts")
      .select("follow_count")
      .eq("listing_id", listingId)
      .maybeSingle(),
  ]);

  const countRaw = (countData as { follow_count?: number | string } | null)?.follow_count;
  const count =
    typeof countRaw === "number" ? countRaw : countRaw != null ? Number(countRaw) : 0;

  return {
    following: Boolean(follow),
    count: Number.isFinite(count) ? count : 0,
  };
}

export async function getUserFollows(): Promise<ListingCardData[]> {
  return fetchBuyerFollowListings();
}
