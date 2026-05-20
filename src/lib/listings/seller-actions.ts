"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  LISTING_IMAGE_ACCEPTED_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGES_BUCKET,
  listingImageObjectPathFromPublicUrl,
  MAX_LISTING_IMAGES,
} from "@/lib/listings/constants";
import { eurosToCents } from "@/lib/listings/money";
import { listingEditFieldSchema } from "@/lib/listings/schemas";
import { ensureUniqueListingSlug } from "@/lib/listings/slug";
import type { ListingStatus } from "@/types/domain";

function safeFileBaseName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "image";
  return base.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "image";
}

function isAcceptedImage(file: File): boolean {
  return (LISTING_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type);
}

type AssertSellerOwnsListingResult =
  | {
      ok: true;
      listingId: string;
      sellerId: string;
      status: ListingStatus;
      title: string;
      slug: string;
      price_cents: number;
    }
  | { ok: false };

async function assertSellerOwnsListing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  listingId: string,
): Promise<AssertSellerOwnsListingResult> {
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!seller) {
    return { ok: false };
  }
  const { data: row, error } = await supabase
    .from("listings")
    .select("id, seller_id, status, title, slug, price_cents")
    .eq("id", listingId)
    .maybeSingle();
  if (error || !row || row.seller_id !== seller.id) {
    return { ok: false };
  }
  return {
    ok: true,
    listingId: row.id as string,
    sellerId: row.seller_id as string,
    status: row.status as ListingStatus,
    title: row.title as string,
    slug: row.slug as string,
    price_cents: row.price_cents as number,
  };
}

export type SimpleActionState = { ok: boolean; error?: string };

export async function archiveSellerListingAction(listingId: string): Promise<SimpleActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const gate = await assertSellerOwnsListing(supabase, user.id, listingId);
    if (!gate.ok || gate.status === "sold") {
      return { ok: false, error: "You cannot archive this listing." };
    }
    const { error } = await supabase
      .from("listings")
      .update({ status: "archived" })
      .eq("id", listingId);
    if (error) {
      console.error("[listings] archiveSellerListingAction", error.message);
      return { ok: false, error: "Could not archive this listing." };
    }
    revalidateListingPaths(gate.slug, gate.listingId);
    return { ok: true };
  } catch (e) {
    console.error("[listings] archiveSellerListingAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function deleteSellerListingAction(listingId: string): Promise<SimpleActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const gate = await assertSellerOwnsListing(supabase, user.id, listingId);
    if (!gate.ok) {
      return { ok: false, error: "You cannot delete this listing." };
    }
    const allowed: ListingStatus[] = ["draft", "pending_review", "rejected", "archived"];
    if (!allowed.includes(gate.status)) {
      return { ok: false, error: "Only draft, in-review, rejected, or archived listings can be deleted." };
    }

    const { data: imgs } = await supabase
      .from("listing_images")
      .select("url")
      .eq("listing_id", listingId);
    for (const row of imgs ?? []) {
      const path = listingImageObjectPathFromPublicUrl(row.url as string);
      if (path) {
        const { error: rmErr } = await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]);
        if (rmErr) {
          console.error("[listings] deleteSellerListingAction storage", path, rmErr.message);
        }
      }
    }

    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) {
      console.error("[listings] deleteSellerListingAction", error.message);
      return { ok: false, error: "Could not delete this listing." };
    }
    revalidateListingPaths(gate.slug, gate.listingId);
    return { ok: true };
  } catch (e) {
    console.error("[listings] deleteSellerListingAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function resubmitSellerListingAction(listingId: string): Promise<SimpleActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const gate = await assertSellerOwnsListing(supabase, user.id, listingId);
    if (!gate.ok || gate.status !== "rejected") {
      return { ok: false, error: "Only rejected listings can be resubmitted." };
    }
    const { error } = await supabase
      .from("listings")
      .update({ status: "pending_review", rejection_reason: null })
      .eq("id", listingId);
    if (error) {
      console.error("[listings] resubmitSellerListingAction", error.message);
      return { ok: false, error: "Could not resubmit this listing." };
    }
    revalidateListingPaths(gate.slug, gate.listingId);
    return { ok: true };
  } catch (e) {
    console.error("[listings] resubmitSellerListingAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function deleteListingImageAction(
  listingId: string,
  imageId: string,
): Promise<SimpleActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const gate = await assertSellerOwnsListing(supabase, user.id, listingId);
    if (!gate.ok || gate.status === "sold") {
      return { ok: false, error: "You cannot edit images on this listing." };
    }

    const { data: img, error: imgErr } = await supabase
      .from("listing_images")
      .select("id, url")
      .eq("id", imageId)
      .eq("listing_id", listingId)
      .maybeSingle();
    if (imgErr || !img) {
      return { ok: false, error: "Image not found." };
    }

    const path = listingImageObjectPathFromPublicUrl(img.url as string);
    if (path) {
      const { error: rmErr } = await supabase.storage.from(LISTING_IMAGES_BUCKET).remove([path]);
      if (rmErr) {
        console.error("[listings] deleteListingImageAction storage", rmErr.message);
      }
    }

    const { error: delErr } = await supabase.from("listing_images").delete().eq("id", imageId);
    if (delErr) {
      console.error("[listings] deleteListingImageAction", delErr.message);
      return { ok: false, error: "Could not remove the image." };
    }

    revalidateListingPaths(gate.slug, gate.listingId);
    return { ok: true };
  } catch (e) {
    console.error("[listings] deleteListingImageAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export type UpdateSellerListingState =
  | { ok: true; slug: string; warning?: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

function revalidateListingPaths(slug: string, listingId: string) {
  revalidatePath("/browse");
  revalidatePath("/");
  revalidatePath("/seller");
  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${listingId}/edit`);
  revalidatePath(`/listing/${slug}`);
  revalidatePath("/admin/listings");
  revalidatePath("/buyer/follows");
}

export async function updateSellerListingAction(
  _prev: UpdateSellerListingState | undefined,
  formData: FormData,
): Promise<UpdateSellerListingState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }

    const listingId = String(formData.get("listing_id") ?? "");
    if (!listingId) {
      return { ok: false, error: "Missing listing." };
    }

    const gate = await assertSellerOwnsListing(supabase, user.id, listingId);
    if (!gate.ok) {
      return { ok: false, error: "Listing not found." };
    }
    if (gate.status === "sold") {
      return { ok: false, error: "Sold listings cannot be edited." };
    }

    const raw = {
      title: String(formData.get("title") ?? ""),
      category_id: String(formData.get("category_id") ?? ""),
      brand_id: String(formData.get("brand_id") ?? ""),
      description: String(formData.get("description") ?? ""),
      condition: String(formData.get("condition") ?? ""),
      price_euros: String(formData.get("price_euros") ?? ""),
      location: String(formData.get("location") ?? ""),
      offers_enabled: formData.get("offers_enabled") === "on",
      protected_delivery_enabled: formData.get("protected_delivery_enabled") === "on",
    };

    const parsed = listingEditFieldSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
    }

    const price = eurosToCents(parsed.data.price_euros);
    if (!price.ok) {
      return {
        ok: false,
        error: price.error,
        fieldErrors: { price_euros: price.error },
      };
    }

    const brandId =
      parsed.data.brand_id && parsed.data.brand_id.length > 0 ? parsed.data.brand_id : null;

    let slug = gate.slug;
    if (parsed.data.title.trim() !== gate.title.trim()) {
      slug = await ensureUniqueListingSlug(supabase, parsed.data.title, listingId);
    }

    let nextStatus: ListingStatus = gate.status;
    if (gate.status === "active" || gate.status === "rejected") {
      nextStatus = "pending_review";
    }

    const patch: Record<string, unknown> = {
      title: parsed.data.title.trim(),
      slug,
      category_id: parsed.data.category_id,
      brand_id: brandId,
      description: parsed.data.description?.trim() || null,
      condition: parsed.data.condition,
      price_cents: price.cents,
      location: parsed.data.location?.trim() || null,
      offers_enabled: parsed.data.offers_enabled,
      protected_delivery_enabled: parsed.data.protected_delivery_enabled,
      status: nextStatus,
    };
    if (nextStatus === "pending_review") {
      patch.rejection_reason = null;
    }

    const { error: upErr } = await supabase.from("listings").update(patch).eq("id", listingId);

    if (upErr) {
      console.error("[listings] updateSellerListingAction", upErr.message, upErr.code);
      return { ok: false, error: "Could not update this listing." };
    }

    const oldPrice = gate.price_cents;
    const newPrice = price.cents;
    if (oldPrice !== newPrice && oldPrice >= 0 && newPrice >= 0) {
      const changePercent =
        oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice) * 100 : null;
      const { error: histErr } = await supabase.from("listing_price_history").insert({
        listing_id: listingId,
        old_price_cents: oldPrice,
        new_price_cents: newPrice,
        change_percent: changePercent,
        changed_by: user.id,
      });
      if (histErr) {
        console.error("[listings] updateSellerListingAction price history", histErr.message);
      }
      if (newPrice < oldPrice) {
        const { error: notifyErr } = await supabase.rpc("notify_price_drop", {
          p_listing_id: listingId,
          p_old_price_cents: oldPrice,
          p_new_price_cents: newPrice,
          p_listing_title: parsed.data.title.trim(),
        });
        if (notifyErr) {
          console.error("[listings] notify_price_drop", notifyErr.message);
        }
      }
    }

    const { count: existingCount } = await supabase
      .from("listing_images")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listingId);

    const files = formData
      .getAll("images")
      .filter((v): v is File => typeof File !== "undefined" && v instanceof File);

    const nonEmpty = files.filter((f) => f.size > 0);
    const room = MAX_LISTING_IMAGES - (existingCount ?? 0);
    if (nonEmpty.length > room) {
      return {
        ok: false,
        error: `You can have at most ${MAX_LISTING_IMAGES} images (including existing).`,
      };
    }

    for (const file of nonEmpty) {
      if (file.size > LISTING_IMAGE_MAX_BYTES) {
        return {
          ok: false,
          error: `Each image must be at most ${LISTING_IMAGE_MAX_BYTES / 1024 / 1024} MB.`,
        };
      }
      if (!isAcceptedImage(file)) {
        return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
      }
    }

    const uploadErrors: string[] = [];
    let order = (existingCount ?? 0) as number;
    for (const file of nonEmpty) {
      const objectPath = `${listingId}/${Date.now()}-${safeFileBaseName(file.name)}`;
      const { error: upSt } = await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .upload(objectPath, file, { contentType: file.type, upsert: false });
      if (upSt) {
        console.error("[listings] updateSellerListingAction upload", objectPath, upSt.message);
        uploadErrors.push(file.name);
        continue;
      }
      const { data: pub } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(objectPath);
      const { error: insImg } = await supabase.from("listing_images").insert({
        listing_id: listingId,
        url: pub.publicUrl,
        sort_order: order,
      });
      if (insImg) {
        console.error("[listings] updateSellerListingAction listing_images", insImg.message);
        uploadErrors.push(file.name);
      } else {
        order += 1;
      }
    }

    let warning: string | undefined;
    if (uploadErrors.length > 0) {
      warning = `${uploadErrors.length} new image(s) failed to upload (${uploadErrors.join(", ")}).`;
    }

    revalidateListingPaths(slug, listingId);
    return { ok: true, slug, warning };
  } catch (e) {
    console.error("[listings] updateSellerListingAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}
