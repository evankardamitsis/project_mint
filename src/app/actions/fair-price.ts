"use server";

import { createClient } from "@/lib/supabase/server";

export type FairPriceData = {
  low: number;
  median: number;
  high: number;
  sampleSize: number;
};

export async function getFairPriceData(
  categoryId: string,
  condition: string,
): Promise<FairPriceData | null> {
  if (!categoryId?.trim() || !condition?.trim()) {
    return null;
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("sold_price_data")
    .select("sold_price")
    .eq("category_id", categoryId)
    .eq("condition", condition)
    .gte("sold_at", since)
    .order("sold_price", { ascending: true });

  if (error) {
    console.error("[fair-price] getFairPriceData", error.message);
    return null;
  }

  if (!data || data.length < 3) {
    return null;
  }

  const prices = data
    .map((d) => Number(d.sold_price))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  if (prices.length < 3) {
    return null;
  }

  const len = prices.length;
  const low = prices[Math.floor(len * 0.1)]!;
  const median = prices[Math.floor(len * 0.5)]!;
  const high = prices[Math.floor(len * 0.9)]!;

  return { low, median, high, sampleSize: len };
}
