import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { ListingCondition } from "@/types/domain";

function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export type SearchResultItem = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
  condition: ListingCondition;
  categoryName: string | null;
  imageUrl: string | null;
  protectedDeliveryEnabled: boolean;
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 120) ?? "";

  if (q.length < 2) {
    return NextResponse.json([] as SearchResultItem[]);
  }

  const supabase = await createClient();
  const safe = escapeIlike(q);

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, title, slug, price_cents, currency, condition, protected_delivery_enabled, categories ( name, slug ), listing_images ( url, sort_order )",
    )
    .eq("status", "active")
    .or(`title.ilike.%${safe}%,description.ilike.%${safe}%`)
    .order("created_at", { ascending: false })
    .limit(7);

  if (error) {
    return NextResponse.json([] as SearchResultItem[]);
  }

  const results: SearchResultItem[] = (data ?? []).map((row) => {
    const images = (
      (row.listing_images as { url: string; sort_order: number }[] | null) ?? []
    ).sort((a, b) => a.sort_order - b.sort_order);

    const catRaw = row.categories as { name: string; slug: string } | { name: string; slug: string }[] | null;
    const cat = Array.isArray(catRaw) ? catRaw[0] : catRaw;

    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      priceCents: row.price_cents as number,
      currency: row.currency as string,
      condition: row.condition as ListingCondition,
      categoryName: cat?.name ?? null,
      imageUrl: images[0]?.url ?? null,
      protectedDeliveryEnabled: Boolean(row.protected_delivery_enabled),
    };
  });

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
