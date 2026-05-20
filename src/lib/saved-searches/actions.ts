"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { BrowseQueryParams } from "@/lib/listings/queries";
import { browsePriceDropsMode } from "@/lib/listings/queries";
import type { ListingCondition } from "@/types/domain";

export type SavedSearchActionState = { ok: boolean; error?: string };

const CONDITIONS: ListingCondition[] = [
  "brand_new",
  "mint",
  "excellent",
  "very_good",
  "good",
  "fair",
  "poor",
  "non_functioning",
];

function hasMeaningfulCriteria(input: {
  query: string | null;
  categoryId: string | null;
  brandId: string | null;
  condition: ListingCondition | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  deal: string | null;
  sort: string | null;
}): boolean {
  if (input.query?.trim()) {
    return true;
  }
  if (input.categoryId || input.brandId) {
    return true;
  }
  if (input.condition) {
    return true;
  }
  if (input.minPriceCents != null && input.minPriceCents > 0) {
    return true;
  }
  if (input.maxPriceCents != null && input.maxPriceCents > 0) {
    return true;
  }
  if (input.deal?.trim()) {
    return true;
  }
  if (input.sort && input.sort !== "newest") {
    return true;
  }
  return false;
}

async function resolveCategoryBrandIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categorySlug: string,
  brandSlug: string,
): Promise<{ categoryId: string | null; brandId: string | null }> {
  let categoryId: string | null = null;
  let brandId: string | null = null;
  if (categorySlug.trim()) {
    const { data } = await supabase.from("categories").select("id").eq("slug", categorySlug.trim()).maybeSingle();
    categoryId = (data?.id as string) ?? null;
  }
  if (brandSlug.trim()) {
    const { data } = await supabase.from("brands").select("id").eq("slug", brandSlug.trim()).maybeSingle();
    brandId = (data?.id as string) ?? null;
  }
  return { categoryId, brandId };
}

function parsePriceCents(raw: string): number | null {
  const t = raw.trim();
  if (!t || !/^\d+(\.\d{1,2})?$/.test(t)) {
    return null;
  }
  return Math.round(Number.parseFloat(t) * 100);
}

function browseFormToPayload(formData: FormData): {
  query: string | null;
  categorySlug: string;
  brandSlug: string;
  condition: ListingCondition | null;
  minPriceCents: number | null;
  maxPriceCents: number | null;
  deal: string | null;
  sort: string | null;
} {
  const q = String(formData.get("q") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "").trim();
  const brandSlug = String(formData.get("brand") ?? "").trim();
  const condRaw = String(formData.get("condition") ?? "").trim();
  const condition = CONDITIONS.includes(condRaw as ListingCondition) ? (condRaw as ListingCondition) : null;
  const minPriceCents = parsePriceCents(String(formData.get("min_price") ?? ""));
  const maxPriceCents = parsePriceCents(String(formData.get("max_price") ?? ""));
  const sortRaw = String(formData.get("sort") ?? "").trim() || "newest";
  const sort = ["newest", "price_asc", "price_desc"].includes(sortRaw) ? sortRaw : "newest";
  const params: BrowseQueryParams = {
    q,
    category: categorySlug,
    brand: brandSlug,
    condition: condRaw,
    min_price: String(formData.get("min_price") ?? ""),
    max_price: String(formData.get("max_price") ?? ""),
    sort,
    deal: String(formData.get("deal") ?? "").trim(),
    priceDrop: String(formData.get("priceDrop") ?? "").trim(),
  };
  const deal = browsePriceDropsMode(params) ? "price-drops" : null;
  return {
    query: q.length > 0 ? q : null,
    categorySlug,
    brandSlug,
    condition,
    minPriceCents,
    maxPriceCents,
    deal,
    sort: sort === "newest" ? null : sort,
  };
}

export async function createSavedSearchAction(_prev: SavedSearchActionState | undefined, formData: FormData): Promise<SavedSearchActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { ok: false, error: "Name is required." };
    }
    if (name.length > 120) {
      return { ok: false, error: "Name is too long." };
    }
    const notificationsEnabled = formData.get("notifications_enabled") === "on" || formData.get("notifications_enabled") === "true";
    const payload = browseFormToPayload(formData);
    const { categoryId, brandId } = await resolveCategoryBrandIds(supabase, payload.categorySlug, payload.brandSlug);

    if (payload.minPriceCents != null && payload.minPriceCents <= 0) {
      return { ok: false, error: "Minimum price must be positive when set." };
    }
    if (payload.maxPriceCents != null && payload.maxPriceCents <= 0) {
      return { ok: false, error: "Maximum price must be positive when set." };
    }
    if (
      payload.minPriceCents != null &&
      payload.maxPriceCents != null &&
      payload.minPriceCents > payload.maxPriceCents
    ) {
      return { ok: false, error: "Minimum price cannot be greater than maximum." };
    }

    const row = {
      query: payload.query,
      category_id: categoryId,
      brand_id: brandId,
      condition: payload.condition,
      min_price_cents: payload.minPriceCents,
      max_price_cents: payload.maxPriceCents,
      deal: payload.deal,
      sort: payload.sort,
    };

    if (
      !hasMeaningfulCriteria({
        query: row.query,
        categoryId: row.category_id,
        brandId: row.brand_id,
        condition: row.condition,
        minPriceCents: row.min_price_cents,
        maxPriceCents: row.max_price_cents,
        deal: row.deal,
        sort: row.sort,
      })
    ) {
      return {
        ok: false,
        error: "Add a search query or at least one filter before saving.",
      };
    }

    const { error } = await supabase.from("saved_searches").insert({
      user_id: user.id,
      name,
      ...row,
      notifications_enabled: notificationsEnabled,
    });
    if (error) {
      console.error("[saved-searches] create", error.message);
      return { ok: false, error: "Could not save this search." };
    }
    revalidatePath("/browse");
    revalidatePath("/buyer");
    revalidatePath("/buyer/alerts");
    revalidatePath("/buyer/saved-searches");
    return { ok: true };
  } catch (e) {
    console.error("[saved-searches] create", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function updateSavedSearchAction(
  savedSearchId: string,
  _prev: SavedSearchActionState | undefined,
  formData: FormData,
): Promise<SavedSearchActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { ok: false, error: "Name is required." };
    }
    const notificationsEnabled = formData.get("notifications_enabled") === "on" || formData.get("notifications_enabled") === "true";
    const { error } = await supabase
      .from("saved_searches")
      .update({ name, notifications_enabled: notificationsEnabled })
      .eq("id", savedSearchId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[saved-searches] update", error.message);
      return { ok: false, error: "Could not update this search." };
    }
    revalidatePath("/buyer/alerts");
    return { ok: true };
  } catch (e) {
    console.error("[saved-searches] update", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function deleteSavedSearchAction(savedSearchId: string): Promise<SavedSearchActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const { error } = await supabase.from("saved_searches").delete().eq("id", savedSearchId).eq("user_id", user.id);
    if (error) {
      console.error("[saved-searches] delete", error.message);
      return { ok: false, error: "Could not delete this search." };
    }
    revalidatePath("/browse");
    revalidatePath("/buyer");
    revalidatePath("/buyer/alerts");
    return { ok: true };
  } catch (e) {
    console.error("[saved-searches] delete", e);
    return { ok: false, error: "Something went wrong." };
  }
}

export async function toggleSavedSearchNotificationsAction(
  savedSearchId: string,
  enabled: boolean,
): Promise<SavedSearchActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "You need to be signed in." };
    }
    const { error } = await supabase
      .from("saved_searches")
      .update({ notifications_enabled: enabled })
      .eq("id", savedSearchId)
      .eq("user_id", user.id);
    if (error) {
      console.error("[saved-searches] toggle notifications", error.message);
      return { ok: false, error: "Could not update notifications." };
    }
    revalidatePath("/buyer/alerts");
    return { ok: true };
  } catch (e) {
    console.error("[saved-searches] toggle notifications", e);
    return { ok: false, error: "Something went wrong." };
  }
}
