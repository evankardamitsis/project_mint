import type { ListingCondition } from "@/types/domain";

/** Row shape returned from list/detail queries (joined slugs for URLs + summaries). */
export type SavedSearchListItem = {
  id: string;
  user_id: string;
  name: string;
  query: string | null;
  category_id: string | null;
  brand_id: string | null;
  category_slug: string | null;
  brand_slug: string | null;
  condition: ListingCondition | null;
  min_price_cents: number | null;
  max_price_cents: number | null;
  deal: string | null;
  sort: string | null;
  notifications_enabled: boolean;
  last_checked_at: string | null;
  last_match_count: number;
  created_at: string;
  updated_at: string;
};
