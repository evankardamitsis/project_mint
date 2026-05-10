"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { eurosToCents } from "@/lib/listings/money";
import { counterOfferFormSchema, createOfferFormSchema } from "@/lib/offers/schemas";
import { effectiveOfferStatus, isOfferActionable } from "@/lib/offers/expiry";
import type { OfferStatus } from "@/types/domain";

const OFFER_TTL_MS = 48 * 60 * 60 * 1000;

export type OfferActionState = { ok: boolean; error?: string; message?: string };

function revalidateOfferPaths(slug?: string | null) {
  revalidatePath("/buyer/offers");
  revalidatePath("/seller/offers");
  revalidatePath("/browse");
  if (slug) {
    revalidatePath(`/listing/${slug}`);
  }
}

export async function createOfferAction(_prev: OfferActionState, formData: FormData): Promise<OfferActionState> {
  try {
    const parsed = createOfferFormSchema.safeParse({
      listing_id: formData.get("listing_id"),
      amount_euros: formData.get("amount_euros"),
    });
    if (!parsed.success) {
      const err = parsed.error.flatten().fieldErrors.amount_euros?.[0] ?? parsed.error.flatten().fieldErrors.listing_id?.[0];
      return { ok: false, error: err ?? "Check your input." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to make an offer." };
    }

    const { data: listing, error: lErr } = await supabase
      .from("listings")
      .select("id, slug, seller_id, status, offers_enabled, price_cents")
      .eq("id", parsed.data.listing_id)
      .maybeSingle();

    if (lErr || !listing) {
      return { ok: false, error: "Listing not found." };
    }
    if (listing.status !== "active") {
      return { ok: false, error: "Offers can only be made on active listings." };
    }
    if (!listing.offers_enabled) {
      return { ok: false, error: "This seller is not accepting offers on this listing." };
    }

    const { data: mySeller } = await supabase.from("seller_profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (mySeller?.id && mySeller.id === listing.seller_id) {
      return { ok: false, error: "You cannot make an offer on your own listing." };
    }

    const money = eurosToCents(parsed.data.amount_euros);
    if (!money.ok) {
      return { ok: false, error: money.error };
    }
    if (money.cents <= 0) {
      return { ok: false, error: "Offer must be greater than zero." };
    }
    const price = listing.price_cents as number;
    if (price > 0 && money.cents >= price) {
      return { ok: false, error: "Your offer must be below the listed price." };
    }

    const { data: existing } = await supabase
      .from("offers")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      return {
        ok: false,
        error: "You already have an open offer on this listing. Cancel it, accept a counter, or wait for the seller.",
      };
    }

    const expiresAt = new Date(Date.now() + OFFER_TTL_MS).toISOString();

    const { error } = await supabase.from("offers").insert({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount_cents: money.cents,
      status: "pending" as OfferStatus,
      expires_at: expiresAt,
    });

    if (error) {
      console.error("[offers] createOfferAction", error.message);
      return { ok: false, error: "Could not submit your offer. Try again." };
    }

    revalidateOfferPaths(listing.slug as string);
    return { ok: true, message: "Offer sent." };
  } catch (e) {
    console.error("[offers] createOfferAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function cancelOfferAction(offerId: string): Promise<OfferActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to manage offers." };
    }

    const { data: row, error: fErr } = await supabase
      .from("offers")
      .select("id, buyer_id, status, expires_at, listings ( slug )")
      .eq("id", offerId)
      .maybeSingle();

    if (fErr || !row || row.buyer_id !== user.id) {
      return { ok: false, error: "Offer not found." };
    }
    const status = row.status as OfferStatus;
    const exp = row.expires_at as string | null;
    if (!isOfferActionable(status, exp)) {
      return { ok: false, error: "This offer can no longer be cancelled." };
    }
    if (status !== "pending" && status !== "countered") {
      return { ok: false, error: "This offer can no longer be cancelled." };
    }

    const { error } = await supabase.from("offers").update({ status: "cancelled" }).eq("id", offerId);
    if (error) {
      console.error("[offers] cancelOfferAction", error.message);
      return { ok: false, error: "Could not cancel the offer." };
    }

    const listings = row.listings as { slug: string } | { slug: string }[];
    const slug = Array.isArray(listings) ? listings[0]?.slug : listings.slug;
    revalidateOfferPaths(slug);
    return { ok: true, message: "Offer cancelled." };
  } catch (e) {
    console.error("[offers] cancelOfferAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function acceptCounterOfferAction(offerId: string): Promise<OfferActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to respond." };
    }

    const { data: row, error: fErr } = await supabase
      .from("offers")
      .select("id, buyer_id, status, expires_at, parent_offer_id, listing_id, listings ( slug, status )")
      .eq("id", offerId)
      .maybeSingle();

    if (fErr || !row || row.buyer_id !== user.id) {
      return { ok: false, error: "Offer not found." };
    }
    if (!row.parent_offer_id) {
      return { ok: false, error: "Use the seller’s response on your original offer from your inbox." };
    }
    const status = row.status as OfferStatus;
    const exp = row.expires_at as string | null;
    if (effectiveOfferStatus(status, exp) !== "pending") {
      return { ok: false, error: "This counter-offer is no longer open." };
    }

    const listing = row.listings as { slug: string; status: string } | { slug: string; status: string }[];
    const L = Array.isArray(listing) ? listing[0] : listing;
    if (!L || L.status !== "active") {
      return { ok: false, error: "This listing is no longer available to accept." };
    }

    const { error } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
    if (error) {
      console.error("[offers] acceptCounterOfferAction", error.message);
      return { ok: false, error: "Could not accept the counter-offer." };
    }

    revalidateOfferPaths(L.slug);
    return {
      ok: true,
      message: "Offer accepted. Checkout/order flow coming next.",
    };
  } catch (e) {
    console.error("[offers] acceptCounterOfferAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function acceptOfferSellerAction(offerId: string): Promise<OfferActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to respond." };
    }

    const { data: row, error: fErr } = await supabase
      .from("offers")
      .select("id, status, expires_at, parent_offer_id, listings ( slug, status, seller_id )")
      .eq("id", offerId)
      .maybeSingle();

    if (fErr || !row) {
      return { ok: false, error: "Offer not found." };
    }

    const rawL = row.listings as
      | { slug: string; status: string; seller_id: string }
      | { slug: string; status: string; seller_id: string }[]
      | null;
    const L = Array.isArray(rawL) ? rawL[0] ?? null : rawL;
    if (!L) {
      return { ok: false, error: "Offer not found." };
    }

    const { data: sp } = await supabase.from("seller_profiles").select("user_id").eq("id", L.seller_id).maybeSingle();
    if (sp?.user_id !== user.id) {
      return { ok: false, error: "You cannot accept this offer." };
    }

    const status = row.status as OfferStatus;
    const exp = row.expires_at as string | null;
    if (effectiveOfferStatus(status, exp) !== "pending") {
      return { ok: false, error: "This offer is no longer open." };
    }
    if (row.parent_offer_id) {
      return { ok: false, error: "The buyer must accept your counter-offer from their account." };
    }
    if (L.status !== "active") {
      return { ok: false, error: "This listing is no longer active." };
    }

    const { error } = await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);
    if (error) {
      console.error("[offers] acceptOfferSellerAction", error.message);
      return { ok: false, error: "Could not accept the offer." };
    }

    revalidateOfferPaths(L.slug);
    return {
      ok: true,
      message: "Offer accepted. Checkout/order flow coming next.",
    };
  } catch (e) {
    console.error("[offers] acceptOfferSellerAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function rejectOfferSellerAction(offerId: string): Promise<OfferActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to respond." };
    }

    const { data: row, error: fErr } = await supabase
      .from("offers")
      .select("id, status, expires_at, listings ( slug, seller_id )")
      .eq("id", offerId)
      .maybeSingle();

    if (fErr || !row) {
      return { ok: false, error: "Offer not found." };
    }
    const rawL = row.listings as
      | { slug: string; seller_id: string }
      | { slug: string; seller_id: string }[]
      | null;
    const L = Array.isArray(rawL) ? rawL[0] ?? null : rawL;
    if (!L) {
      return { ok: false, error: "Offer not found." };
    }

    const { data: sp } = await supabase.from("seller_profiles").select("user_id").eq("id", L.seller_id).maybeSingle();
    if (sp?.user_id !== user.id) {
      return { ok: false, error: "You cannot reject this offer." };
    }

    const status = row.status as OfferStatus;
    const exp = row.expires_at as string | null;
    if (!isOfferActionable(status, exp)) {
      return { ok: false, error: "This offer is no longer open." };
    }

    const { error } = await supabase.from("offers").update({ status: "rejected" }).eq("id", offerId);
    if (error) {
      console.error("[offers] rejectOfferSellerAction", error.message);
      return { ok: false, error: "Could not reject the offer." };
    }

    revalidateOfferPaths(L.slug);
    return { ok: true, message: "Offer rejected." };
  } catch (e) {
    console.error("[offers] rejectOfferSellerAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function counterOfferSellerAction(_prev: OfferActionState, formData: FormData): Promise<OfferActionState> {
  try {
    const parsed = counterOfferFormSchema.safeParse({
      offer_id: formData.get("offer_id"),
      amount_euros: formData.get("amount_euros"),
    });
    if (!parsed.success) {
      const err =
        parsed.error.flatten().fieldErrors.amount_euros?.[0] ??
        parsed.error.flatten().fieldErrors.offer_id?.[0];
      return { ok: false, error: err ?? "Check your input." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in to respond." };
    }

    const money = eurosToCents(parsed.data.amount_euros);
    if (!money.ok) {
      return { ok: false, error: money.error };
    }
    if (money.cents <= 0) {
      return { ok: false, error: "Counter amount must be greater than zero." };
    }

    const { data: parentRow } = await supabase
      .from("offers")
      .select("listing_id, listings ( slug )")
      .eq("id", parsed.data.offer_id)
      .maybeSingle();
    const rawPl = parentRow?.listings as { slug: string } | { slug: string }[] | null | undefined;
    const parentSlug = rawPl
      ? Array.isArray(rawPl)
        ? rawPl[0]?.slug
        : rawPl.slug
      : undefined;

    const { error } = await supabase.rpc("create_counter_offer", {
      p_parent_id: parsed.data.offer_id,
      p_amount_cents: money.cents,
    });

    if (error) {
      console.error("[offers] counterOfferSellerAction", error.message, error.code);
      const msg = error.message ?? "";
      if (msg.includes("OFFER_NOT_PENDING") || msg.includes("OFFER_EXPIRED")) {
        return { ok: false, error: "This offer can no longer be countered." };
      }
      if (msg.includes("LISTING_NOT_ACTIVE")) {
        return { ok: false, error: "This listing is no longer active." };
      }
      if (msg.includes("FORBIDDEN")) {
        return { ok: false, error: "You cannot counter this offer." };
      }
      if (msg.includes("INVALID_AMOUNT")) {
        return { ok: false, error: "Enter a valid amount." };
      }
      return { ok: false, error: "Could not send counter-offer. Try again." };
    }

    revalidateOfferPaths(parentSlug);
    return { ok: true, message: "Counter-offer sent." };
  } catch (e) {
    console.error("[offers] counterOfferSellerAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
