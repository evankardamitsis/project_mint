"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/guards";
import { hasRole } from "@/lib/roles";
import { platformFeeCents } from "@/lib/orders/fees";
import { ensureProtectedDeliveryCheckForOrder } from "@/lib/protected-delivery/ensure-check";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentStatus } from "@/types/domain";

function revalidateOrderSurfaces(listingSlug?: string | null) {
  revalidatePath("/buyer/purchases");
  revalidatePath("/seller/orders");
  revalidatePath("/admin/orders");
  if (listingSlug) {
    revalidatePath(`/listing/${listingSlug}`);
  }
}

function runAdmin<T>(fn: (admin: ReturnType<typeof createAdminClient>) => Promise<T>): Promise<T> {
  const admin = createAdminClient();
  return fn(admin);
}

function isNextRedirectError(e: unknown): boolean {
  if (typeof e !== "object" || e === null || !("digest" in e)) {
    return false;
  }
  const d = (e as { digest?: unknown }).digest;
  return typeof d === "string" && d.startsWith("NEXT_REDIRECT");
}

export async function buyNowOrderAction(formData: FormData): Promise<void> {
  const listingId = String(formData.get("listing_id") ?? "").trim();
  if (!listingId) {
    throw new Error("Missing listing.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(`/listing/${formData.get("listing_slug") ?? ""}`)}`);
  }

  const { data: mySeller } = await supabase.from("seller_profiles").select("id").eq("user_id", user.id).maybeSingle();
  const slugForRedirect = String(formData.get("listing_slug") ?? "").trim();

  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("id, slug, seller_id, status, price_cents, currency")
    .eq("id", listingId)
    .maybeSingle();

  if (lErr || !listing) {
    redirect(slugForRedirect ? `/listing/${slugForRedirect}` : "/browse");
  }

  if (listing.status !== "active") {
    redirect(`/listing/${listing.slug as string}`);
  }
  if (mySeller?.id && mySeller.id === listing.seller_id) {
    redirect(`/listing/${listing.slug as string}`);
  }

  const amount = listing.price_cents as number;
  const fee = platformFeeCents(amount);

  try {
    const { data: order, error: oErr } = await runAdmin(async (admin) => {
      return admin
        .from("orders")
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id as string,
          offer_id: null,
          amount_cents: amount,
          platform_fee_cents: fee,
          protected_delivery_fee_cents: 0,
          currency: (listing.currency as string) ?? "EUR",
          status: "pending_payment",
          payment_status: "unpaid",
        })
        .select("id")
        .single();
    });

    if (oErr || !order) {
      console.error("[orders] buyNowOrderAction insert", oErr?.message, oErr?.code);
      if (oErr?.code === "23505") {
        const { data: existing } = await runAdmin(async (admin) =>
          admin
            .from("orders")
            .select("id, buyer_id")
            .eq("listing_id", listing.id)
            .is("offer_id", null)
            .in("status", [
              "pending_payment",
              "paid",
              "cleared_for_shipping",
              "shipped",
              "delivered",
              "disputed",
            ])
            .maybeSingle(),
        );
        if (existing?.id && existing.buyer_id === user.id) {
          redirect(`/buyer/purchases/${existing.id as string}`);
        }
      }
      redirect(`/listing/${listing.slug as string}`);
    }

    const { error: uErr } = await runAdmin(async (admin) =>
      admin.from("listings").update({ status: "reserved" }).eq("id", listing.id).eq("status", "active"),
    );
    if (uErr) {
      console.error("[orders] buyNowOrderAction listing update", uErr.message);
      await runAdmin(async (admin) => admin.from("orders").delete().eq("id", order.id as string));
      redirect(`/listing/${listing.slug as string}`);
    }

    revalidateOrderSurfaces(listing.slug as string);
    redirect(`/buyer/purchases/${order.id as string}`);
  } catch (e) {
    if (isNextRedirectError(e)) {
      throw e;
    }
    console.error("[orders] buyNowOrderAction", e);
    redirect(`/listing/${listing.slug as string}`);
  }
}

export async function createOrderFromOfferAction(offerId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent("/buyer/offers")}`);
  }

  const { data: existing } = await supabase.from("orders").select("id").eq("offer_id", offerId).maybeSingle();
  if (existing?.id) {
    redirect(`/buyer/purchases/${existing.id as string}`);
  }

  const { data: offer, error: oErr } = await supabase
    .from("offers")
    .select("id, listing_id, buyer_id, seller_id, amount_cents, status")
    .eq("id", offerId)
    .maybeSingle();

  if (oErr || !offer || offer.buyer_id !== user.id || offer.status !== "accepted") {
    redirect("/buyer/offers");
  }

  const amount = offer.amount_cents as number;
  const fee = platformFeeCents(amount);

  const { data: listing } = await supabase.from("listings").select("id, slug, currency").eq("id", offer.listing_id).maybeSingle();

  try {
    const { data: order, error: insErr } = await runAdmin(async (admin) =>
      admin
        .from("orders")
        .insert({
          listing_id: offer.listing_id as string,
          buyer_id: user.id,
          seller_id: offer.seller_id as string,
          offer_id: offer.id as string,
          amount_cents: amount,
          platform_fee_cents: fee,
          protected_delivery_fee_cents: 0,
          currency: (listing?.currency as string) ?? "EUR",
          status: "pending_payment",
          payment_status: "unpaid",
        })
        .select("id")
        .single(),
    );

    if (insErr || !order) {
      console.error("[orders] createOrderFromOfferAction", insErr?.message, insErr?.code);
      if (insErr?.code === "23505") {
        const { data: raced } = await supabase.from("orders").select("id").eq("offer_id", offerId).maybeSingle();
        if (raced?.id) {
          redirect(`/buyer/purchases/${raced.id as string}`);
        }
      }
      redirect("/buyer/offers");
    }

    revalidateOrderSurfaces(listing?.slug as string | undefined);
    redirect(`/buyer/purchases/${order.id as string}`);
  } catch (e) {
    if (isNextRedirectError(e)) {
      throw e;
    }
    console.error("[orders] createOrderFromOfferAction", e);
    redirect("/buyer/offers");
  }
}

export async function createOrderFromOfferFormAction(formData: FormData): Promise<void> {
  const id = String(formData.get("offer_id") ?? "").trim();
  if (!id) {
    redirect("/buyer/offers");
  }
  await createOrderFromOfferAction(id);
}

export async function demoMarkOrderPaidAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Sign in required." };
    }

    const { data: row } = await supabase
      .from("orders")
      .select("id, buyer_id, status, payment_status, listing_id, listings ( slug )")
      .eq("id", orderId)
      .maybeSingle();
    if (!row || row.buyer_id !== user.id) {
      return { ok: false, error: "Order not found." };
    }
    if (row.status !== "pending_payment" || row.payment_status !== "unpaid") {
      return { ok: false, error: "Demo payment only applies to unpaid checkout." };
    }

    const rawL = row.listings as { slug: string } | { slug: string }[] | null;
    const slug = rawL ? (Array.isArray(rawL) ? rawL[0]?.slug : rawL.slug) : null;

    const { error } = await runAdmin(async (admin) =>
      admin
        .from("orders")
        .update({
          status: "cleared_for_shipping",
          payment_status: "held",
        })
        .eq("id", orderId)
        .eq("buyer_id", user.id)
        .eq("status", "pending_payment")
        .eq("payment_status", "unpaid"),
    );

    if (error) {
      console.error("[orders] demoMarkOrderPaidAction", error.message);
      return { ok: false, error: "Could not update payment (demo)." };
    }

    await ensureProtectedDeliveryCheckForOrder(orderId);

    revalidateOrderSurfaces(slug ?? undefined);
    revalidatePath(`/buyer/purchases/${orderId}`);
    revalidatePath(`/seller/orders/${orderId}`);
    return { ok: true };
  } catch (e) {
    console.error("[orders] demoMarkOrderPaidAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function confirmDeliveryAction(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Απαιτείται σύνδεση." };
    }

    const { data: row } = await supabase
      .from("orders")
      .select("id, buyer_id, status, payment_status, listing_id, listings ( slug )")
      .eq("id", orderId)
      .maybeSingle();
    if (!row || row.buyer_id !== user.id) {
      return { ok: false, error: "Η παραγγελία δεν βρέθηκε." };
    }
    if (row.status !== "shipped") {
      return { ok: false, error: "Η παραγγελία δεν βρίσκεται σε κατάσταση αποστολής." };
    }

    const rawL = row.listings as { slug: string } | { slug: string }[] | null;
    const slug = rawL ? (Array.isArray(rawL) ? rawL[0]?.slug : rawL.slug) : null;

    const { error } = await runAdmin(async (admin) =>
      admin
        .from("orders")
        .update({ status: "completed", payment_status: "released" })
        .eq("id", orderId)
        .eq("buyer_id", user.id)
        .eq("status", "shipped"),
    );

    if (error) {
      console.error("[orders] confirmDeliveryAction", error.message);
      return { ok: false, error: "Δεν ήταν δυνατή η επιβεβαίωση." };
    }

    revalidateOrderSurfaces(slug ?? undefined);
    revalidatePath(`/buyer/purchases/${orderId}`);
    revalidatePath(`/seller/orders/${orderId}`);
    return { ok: true };
  } catch (e) {
    console.error("[orders] confirmDeliveryAction", e);
    return { ok: false, error: "Κάτι πήγε στραβά." };
  }
}

const adminEditableStatuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "cleared_for_shipping",
  "shipped",
  "delivered",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
];

export async function adminUpdateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  paymentStatus: PaymentStatus,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getProfile();
  if (!profile || !hasRole(profile.role, "admin")) {
    return { ok: false, error: "Forbidden." };
  }
  if (!adminEditableStatuses.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    const { error } = await runAdmin(async (admin) =>
      admin.from("orders").update({ status, payment_status: paymentStatus }).eq("id", orderId),
    );
    if (error) {
      console.error("[orders] adminUpdateOrderStatusAction", error.message);
      return { ok: false, error: "Update failed." };
    }

    if (status === "cleared_for_shipping" && paymentStatus === "held") {
      await ensureProtectedDeliveryCheckForOrder(orderId);
    }

    revalidateOrderSurfaces();
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/buyer/purchases/${orderId}`);
    revalidatePath(`/seller/orders/${orderId}`);
    return { ok: true };
  } catch (e) {
    console.error("[orders] adminUpdateOrderStatusAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
