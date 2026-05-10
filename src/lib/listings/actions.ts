"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  LISTING_IMAGE_ACCEPTED_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  LISTING_IMAGES_BUCKET,
  MAX_LISTING_IMAGES,
} from "@/lib/listings/constants";
import { eurosToCents } from "@/lib/listings/money";
import { listingCreateFieldSchema } from "@/lib/listings/schemas";
import { ensureUniqueListingSlug } from "@/lib/listings/slug";

export type CreateListingState =
  | { ok: true; slug: string; warning?: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

function safeFileBaseName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "image";
  return base.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "image";
}

function isAcceptedImage(file: File): boolean {
  return (LISTING_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type);
}

export async function createSellerProfileAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (pErr) {
      console.error("[listings] createSellerProfileAction profile", pErr.message);
      return { ok: false, error: "Could not load your profile." };
    }
    const display = profile?.full_name?.trim() || "Seller";
    const { error } = await supabase.from("seller_profiles").insert({
      user_id: user.id,
      display_name: display,
    });
    if (error) {
      console.error("[listings] createSellerProfileAction insert", error.message);
      return { ok: false, error: "Could not create seller profile. Try again." };
    }
    revalidatePath("/seller");
    revalidatePath("/seller/listings/new");
    return { ok: true };
  } catch (e) {
    console.error("[listings] createSellerProfileAction", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function createListingAction(
  _prev: CreateListingState | undefined,
  formData: FormData,
): Promise<CreateListingState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }

    const { data: seller, error: sellerErr } = await supabase
      .from("seller_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (sellerErr || !seller) {
      console.error("[listings] createListingAction seller", sellerErr?.message);
      return {
        ok: false,
        error: "Create a seller profile before listing gear.",
      };
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
      protected_delivery_enabled:
        formData.get("protected_delivery_enabled") === "on",
    };

    const parsed = listingCreateFieldSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return {
        ok: false,
        error: "Please fix the highlighted fields.",
        fieldErrors,
      };
    }

    const price = eurosToCents(parsed.data.price_euros);
    if (!price.ok) {
      return {
        ok: false,
        error: price.error,
        fieldErrors: { price_euros: price.error },
      };
    }

    const files = formData
      .getAll("images")
      .filter((v): v is File => typeof File !== "undefined" && v instanceof File);

    if (files.length > MAX_LISTING_IMAGES) {
      return {
        ok: false,
        error: `You can upload at most ${MAX_LISTING_IMAGES} images.`,
      };
    }

    for (const file of files) {
      if (file.size === 0) {
        continue;
      }
      if (file.size > LISTING_IMAGE_MAX_BYTES) {
        return {
          ok: false,
          error: `Each image must be at most ${LISTING_IMAGE_MAX_BYTES / 1024 / 1024} MB.`,
        };
      }
      if (!isAcceptedImage(file)) {
        return {
          ok: false,
          error: "Only JPEG, PNG, WebP, or GIF images are allowed.",
        };
      }
    }

    const slug = await ensureUniqueListingSlug(supabase, parsed.data.title);
    const brandId =
      parsed.data.brand_id && parsed.data.brand_id.length > 0
        ? parsed.data.brand_id
        : null;

    const { data: listing, error: insertErr } = await supabase
      .from("listings")
      .insert({
        seller_id: seller.id,
        category_id: parsed.data.category_id,
        brand_id: brandId,
        title: parsed.data.title.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        condition: parsed.data.condition,
        price_cents: price.cents,
        currency: "EUR",
        location: parsed.data.location?.trim() || null,
        status: "pending_review",
        offers_enabled: parsed.data.offers_enabled,
        protected_delivery_enabled: parsed.data.protected_delivery_enabled,
      })
      .select("id")
      .single();

    if (insertErr || !listing) {
      console.error("[listings] createListingAction insert", insertErr?.message);
      return {
        ok: false,
        error: "We could not save your listing. Try again in a moment.",
      };
    }

    const listingId = listing.id as string;
    const nonEmptyFiles = files.filter((f) => f.size > 0);
    const uploadErrors: string[] = [];
    const rows: { listing_id: string; url: string; sort_order: number }[] = [];

    let order = 0;
    for (const file of nonEmptyFiles) {
      const objectPath = `${listingId}/${Date.now()}-${safeFileBaseName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .upload(objectPath, file, {
          contentType: file.type,
          upsert: false,
        });
      if (upErr) {
        console.error("[listings] upload", objectPath, upErr.message);
        uploadErrors.push(file.name);
        continue;
      }
      const { data: pub } = supabase.storage
        .from(LISTING_IMAGES_BUCKET)
        .getPublicUrl(objectPath);
      rows.push({
        listing_id: listingId,
        url: pub.publicUrl,
        sort_order: order,
      });
      order += 1;
    }

    if (rows.length > 0) {
      const { error: imgErr } = await supabase.from("listing_images").insert(rows);
      if (imgErr) {
        console.error("[listings] listing_images insert", imgErr.message);
        return {
          ok: true,
          slug,
          warning:
            "Listing saved, but we could not attach image records. You can add photos later from your dashboard once editing is available.",
        };
      }
    }

    let warning: string | undefined;
    if (uploadErrors.length > 0) {
      warning = `Listing saved, but ${uploadErrors.length} image(s) failed to upload (${uploadErrors.join(", ")}). Your listing is still in review.`;
    }

    revalidatePath("/browse");
    revalidatePath("/");
    revalidatePath("/seller/listings");
    revalidatePath(`/listing/${slug}`);

    return { ok: true, slug, warning };
  } catch (e) {
    console.error("[listings] createListingAction", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
