import type {
  ListingCondition,
  ListingStatus,
  SellerPayoutStatus,
  SellerTier,
  SellerVerificationStatus,
} from "@/types/domain";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
}

export interface ListingImageRow {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ListingCardData {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  condition: ListingCondition;
  location: string | null;
  status: ListingStatus;
  created_at: string;
  primary_image_url: string | null;
  protected_delivery_enabled?: boolean;
  /** Category display name when joined in browse/home queries */
  category_name?: string | null;
  /** Category slug when joined in browse/home queries */
  category_slug?: string | null;
  /** Seller shop name from `seller_profiles.display_name` when joined */
  seller_display_name?: string | null;
  /** Seller tier when joined in browse/home queries */
  seller_tier?: SellerTier | null;
  /** Seller account id (`seller_profiles.user_id`); for save/owner checks on public grids */
  seller_owner_user_id?: string | null;
  /** When viewer is logged in; omitted/false for anonymous */
  is_followed_by_current_user?: boolean;
  /** Aggregate followers (seller dashboard only); no identities */
  follow_count?: number;
  /** Signed % change for latest ≥5% price-down on active listing; null if none */
  latest_price_drop_percent?: number | null;
  latest_price_drop_old_price_cents?: number | null;
  latest_price_drop_created_at?: string | null;
  /** Follows page: when the user started following */
  followed_at?: string | null;
}

export interface ListingDetailData {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingStatus;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  created_at: string;
  published_at: string | null;
  rejection_reason: string | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  seller_display_name: string;
  /** From `seller_profiles` when present; used for listing detail subline. */
  seller_sales_count?: number | null;
  /** From `seller_profiles` when present (e.g. 4.8). */
  seller_rating?: number | null;
  seller_tier?: SellerTier | null;
  images: ListingImageRow[];
  /** Current viewer follows this listing */
  is_followed_by_current_user: boolean;
  /** Total followers (public on detail) */
  follow_count?: number;
  latest_price_drop_percent?: number | null;
  latest_price_drop_old_price_cents?: number | null;
  latest_price_drop_created_at?: string | null;
}

export interface SellerProfileRow {
  id: string;
  user_id: string;
  display_name: string;
}

export interface SellerProfileFull extends SellerProfileRow {
  bio: string | null;
  location: string | null;
  phone: string | null;
  verification_status: SellerVerificationStatus;
  payout_status: SellerPayoutStatus;
  seller_tier?: SellerTier;
  completed_sales_count?: number;
  average_rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SellerListingEditData {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  condition: ListingCondition;
  price_cents: number;
  currency: string;
  location: string | null;
  status: ListingStatus;
  category_id: string;
  brand_id: string | null;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  images: ListingImageRow[];
  /** Recent price changes (seller edit UI); newest first */
  price_history?: ListingPriceHistoryRow[];
}

export interface ListingPriceHistoryRow {
  id: string;
  old_price_cents: number;
  new_price_cents: number;
  change_percent: number | null;
  created_at: string;
}

export interface AdminListingRow {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  condition: ListingCondition;
  status: ListingStatus;
  created_at: string;
  seller_display_name: string;
  category_name: string | null;
  primary_image_url: string | null;
  /** Latest ≥5% price-down (active listings); admin moderation context */
  latest_price_drop_percent?: number | null;
}
