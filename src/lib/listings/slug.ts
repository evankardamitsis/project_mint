import type { SupabaseClient } from "@supabase/supabase-js";

export function slugifyTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length > 0 ? base : "listing";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Reserves a unique slug in `public.listings` using `listing_slug_taken` (RLS-safe).
 */
export async function ensureUniqueListingSlug(
  supabase: SupabaseClient,
  title: string,
  excludeListingId?: string | null,
): Promise<string> {
  let candidate = slugifyTitle(title);
  for (let i = 0; i < 12; i += 1) {
    const { data, error } = await supabase.rpc("listing_slug_taken", {
      p_slug: candidate,
      p_exclude_listing_id: excludeListingId ?? null,
    });
    if (error) {
      throw error;
    }
    if (data !== true) {
      return candidate;
    }
    candidate = `${slugifyTitle(title)}-${randomSuffix()}`;
  }
  throw new Error("Could not generate a unique slug.");
}
